/**
 * Soft 3D shapes extruded with pillowy rounded edges and shaded as pearl / silver.
 * Two families: clean geometric forms in the spirit of Pixel wallpapers (circle, half
 * circle, quarter circle, pill, rounded square, arch) and symbols that match the section
 * they sit in (search lens, growth arrow, heart, chat bubble, map pin…).
 * Each shape can morph into another. Ray-marched in one fragment shader; no downloads.
 */

export const MAX_SHAPES = 6;
/** Shape ids used by the layouts */
export const SHAPE = {
  circle: 0, half: 1, pill: 2, squircle: 3, arch: 4, quarter: 5,
  heart: 6, star: 7, ring: 8, bubble: 9, arrow: 10, play: 11, plus: 12, sparkle: 13, pin: 14, check: 15, code: 16, bars: 17,
} as const;

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform vec4 uS[${MAX_SHAPES * 3}];   // per shape: (x,y,z,scale) (rx,ry,rz,morph) (typeA,typeB,-,-)
uniform float uN;
uniform float uDark;
uniform float uShadow;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float dot2(vec2 v) { return dot(v, v); }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdTri(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
float sdHeart(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - 0.35355;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}
float sdStar(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809017, -0.587785);
  const vec2 k2 = vec2(-0.809017, -0.587785);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

// 2D outlines, roughly unit sized
float shape2D(float type, vec2 p) {
  float a = atan(p.y, p.x);
  float l = length(p);
  if (type < 0.5) return l - 0.8;                                                   // circle
  if (type < 1.5) { vec2 q = p - vec2(0.0, -0.34); return max(length(q) - 0.84, -q.y) - 0.07; } // half circle
  if (type < 2.5) { vec2 q = p; q.x -= clamp(q.x, -0.5, 0.5); return length(q) - 0.44; } // pill
  if (type < 3.5) return sdBox(p, vec2(0.42)) - 0.34;                               // squircle
  if (type < 4.5) return min(sdBox(p - vec2(0.0, -0.3), vec2(0.66, 0.42)) - 0.04, length(p - vec2(0.0, 0.1)) - 0.68); // arch
  if (type < 5.5) { vec2 q = p + vec2(0.5, 0.5); return max(max(length(q) - 1.18, -q.x), -q.y) - 0.07; } // quarter circle
  if (type < 6.5) return sdHeart(p / 1.2 + vec2(0.0, 0.5)) * 1.2 - 0.05;           // heart
  if (type < 7.5) return sdStar(p + vec2(0.0, 0.06), 0.92, 0.5) - 0.07;             // star
  if (type < 8.5) return abs(l - 0.6) - 0.25;                                       // ring (search lens)
  if (type < 9.5) return smin(length(p - vec2(0.05, 0.1)) - 0.7,                    // chat bubble
                    sdBox(rot(0.75) * (p - vec2(-0.42, -0.58)), vec2(0.13, 0.2)) - 0.05, 0.14);
  if (type < 10.5) return smin(sdTri(p - vec2(0.0, 0.3), 0.6) - 0.06,               // growth arrow
                    sdBox(p - vec2(0.0, -0.38), vec2(0.17, 0.42)) - 0.05, 0.08);
  if (type < 11.5) return sdTri(vec2(-p.y, p.x + 0.12), 0.56) - 0.13;               // play
  if (type < 12.5) return min(sdBox(p, vec2(0.66, 0.17)), sdBox(p, vec2(0.17, 0.66))) - 0.1; // plus
  if (type < 13.5) return (l - (0.36 + 0.56 * pow(0.5 + 0.5 * cos(4.0 * a), 2.2))) * 0.6; // sparkle
  if (type < 14.5) {                                                                // map pin
    float d = smin(length(p - vec2(0.0, 0.18)) - 0.58, sdTri(vec2(p.x, -p.y - 0.38), 0.4) - 0.04, 0.2);
    return max(d, -(length(p - vec2(0.0, 0.2)) - 0.22));
  }
  if (type < 15.5) return min(sdSeg(p, vec2(-0.58, 0.02), vec2(-0.16, -0.42)), sdSeg(p, vec2(-0.16, -0.42), vec2(0.62, 0.46))) - 0.17; // check
  if (type < 16.5) { vec2 q = vec2(abs(p.x), p.y);                                  // code </>
    return min(sdSeg(q, vec2(0.28, 0.48), vec2(0.72, 0.0)), sdSeg(q, vec2(0.72, 0.0), vec2(0.28, -0.48))) - 0.14; }
  return min(min(sdBox(p - vec2(-0.5, -0.32), vec2(0.15, 0.3)), sdBox(p - vec2(0.0, -0.12), vec2(0.15, 0.5))), // bars
             sdBox(p - vec2(0.5, 0.08), vec2(0.15, 0.7))) - 0.08;
}

float sdShape(vec3 p, vec4 A, vec4 B, vec4 C) {
  vec3 q = p - A.xyz;
  q.xz = rot(B.y) * q.xz;
  q.yz = rot(B.x) * q.yz;
  q.xy = rot(B.z) * q.xy;
  q /= A.w;
  float d2 = mix(shape2D(C.x, q.xy), shape2D(C.y, q.xy), B.w);
  // Extrude with pillow-rounded edges
  float h = 0.2, rr = 0.16;
  vec2 w = vec2(d2 + rr, abs(q.z) - h + rr);
  return (min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - rr) * A.w;
}

float map(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (float(i) >= uN) break;
    d = min(d, sdShape(p, uS[i * 3], uS[i * 3 + 1], uS[i * 3 + 2]));
  }
  return d;
}

vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

// Soft studio reflections
vec3 env(vec3 r) {
  float y = r.y;
  vec3 c = mix(vec3(0.74, 0.75, 0.78), vec3(0.99, 0.99, 1.0), smoothstep(-0.3, 0.9, y));
  c = mix(c, mix(vec3(0.16, 0.16, 0.19), vec3(0.55, 0.56, 0.6), smoothstep(-0.3, 0.9, y)), uDark);
  c += 0.7 * smoothstep(0.82, 0.98, dot(r, normalize(vec3(-0.55, 0.6, 0.6))));
  c += 0.45 * smoothstep(0.88, 0.99, dot(r, normalize(vec3(0.7, -0.1, 0.7))));
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  float px = 2.0 / uRes.y;

  // 2D pass: skip empty pixels early and draw a soft floor shadow
  float near = 1e5;
  float sd = 1e5;
  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (float(i) >= uN) break;
    vec4 A = uS[i * 3];
    vec4 B = uS[i * 3 + 1];
    vec4 C = uS[i * 3 + 2];
    float r = length(uv - A.xy) - A.w * 1.35;
    near = min(near, r);
    // Contact shadow: same outline, offset down, softness relative to the shape size
    if (uShadow > 0.0 && r < A.w * 1.1) {
      vec2 q = rot(B.z) * ((uv - A.xy) / A.w + vec2(-0.06, 0.24));
      sd = min(sd, mix(shape2D(C.x, q), shape2D(C.y, q), B.w) / 0.42);
    }
  }
  float shadow = uShadow * (1.0 - smoothstep(-0.25, 0.9, sd));
  if (near > 0.02) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadow);
    return;
  }

  vec3 ro = vec3(uv, 3.0);
  vec3 rd = vec3(0.0, 0.0, -1.0);
  float t = 0.0, d = 1.0, md = 1e5;
  for (int i = 0; i < 64; i++) {
    d = map(ro + rd * t);
    md = min(md, d);
    if (d < 0.001 || t > 6.0) break;
    t += d * 0.85;
  }
  float alpha = d < 0.001 ? 1.0 : 1.0 - smoothstep(0.0, px * 1.4, md);
  if (alpha <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadow);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  vec3 L = normalize(vec3(-0.45, 0.7, 0.6));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float wrap = clamp(dot(n, normalize(vec3(0.6, -0.3, 0.7))) * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(vec3(0.93, 0.935, 0.95), vec3(0.78, 0.79, 0.82), uDark);
  vec3 c = base * (0.36 + 0.5 * diff + 0.18 * wrap);           // satin body
  c = mix(c, env(reflect(rd, n)), 0.42);                      // silver reflections
  float fres = pow(1.0 - max(n.z, 0.0), 3.0);
  c += fres * 0.1;
  c *= mix(vec3(1.0), vec3(0.975, 0.985, 1.02), fres);        // faint pearl edge
  c = clamp(c, 0.0, 1.0);

  float a = alpha + shadow * (1.0 - alpha);
  gl_FragColor = vec4(c * alpha, a);
}
`;
