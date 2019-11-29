const vec3 c = vec3(1.,0.,-1.);
const float pi = acos(-1.);

void rand(in vec2 x, out float n)
{
    x += 400.;
    n = fract(sin(dot(sign(x)*abs(x) ,vec2(12.9898,78.233)))*43758.5453);
}

void lfnoise(in vec2 t, out float n)
{
    vec2 i = floor(t);
    t = fract(t);
    t = smoothstep(c.yy, c.xx, t);
    vec2 v1, v2;
    rand(i, v1.x);
    rand(i+c.xy, v1.y);
    rand(i+c.yx, v2.x);
    rand(i+c.xx, v2.y);
    v1 = c.zz+2.*mix(v1, v2, t.y);
    n = mix(v1.x, v1.y, t.x);
}

void mfnoise(in vec2 x, in float d, in float b, in float e, out float n)
{
    n = 0.;
    float a = 1., nf = 0., buf;
    for(float f = d; f<b; f *= 2.)
    {
        lfnoise(f*x, buf);
        n += a*buf;
        a *= e;
        nf += 1.;
    }
    n *= (1.-e)/(1.-pow(e, nf));
}

// Distance to regular voronoi
void dvoronoi(in vec2 x, out float d, out vec2 ind)
{
    vec2 y = floor(x);
   	float ret = 1.;
    
    //find closest control point. ("In which cell am I?")
    vec2 pf=c.yy, p;
    float df=10.;
    
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            d = length(x-p);
            
            if(d < df)
            {
                df = d;
                pf = p;
            }
        }
    
    //compute voronoi distance: minimum distance to any edge
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            vec2 o = p - pf;
            d = length(.5*o-dot(x-pf, o)/dot(o,o)*o);
            ret = min(ret, d);
        }
    
    d = ret;
    ind = pf;
}

void smoothmin(in float a, in float b, in float k, out float dst)
{
    float h = max( k-abs(a-b), 0.0 )/k;
    dst = min( a, b ) - h*h*h*k*(1.0/6.0);
}

// Distance to regular voronoi
void dsmoothvoronoi(in vec2 x, out float d, out vec2 ind)
{
    vec2 y = floor(x);
   	float ret = 1.;
    
    //find closest control point. ("In which cell am I?")
    vec2 pf=c.yy, p;
    float df=10.;
    
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            d = length(x-p);
            
            if(d < df)
            {
                df = d;
                pf = p;
            }
        }
    
    //compute voronoi distance: minimum distance to any edge
    for(int i=-1; i<=1; i+=1)
        for(int j=-1; j<=1; j+=1)
        {
            p = y + vec2(float(i), float(j));
            vec2 pa;
            rand(p, pa.x);
            rand(p-1.3, pa.y);
            //pa = .5+.5*pa;
            p += pa;
            
            vec2 o = p - pf;
            d = length(.5*o-dot(x-pf, o)/dot(o,o)*o);
            smoothmin(ret, d, .2, ret);
        }
    
    d = ret;
    ind = pf;
}

void zextrude(in float z, in float d2d, in float h, out float d)
{
    vec2 w = vec2(-d2d, abs(z)-0.5*h);
    d = length(max(w,0.0));
}

void add(in vec2 sda, in vec2 sdb, out vec2 sdf)
{
    sdf = (sda.x<sdb.x)?sda:sdb;
}

void scene(in vec3 x, out vec2 sdf)
{
 	float n;
    mfnoise(x.xy, 1., 1.e2, .45, n);
    
    float v;
    vec2 vi;
    
    dsmoothvoronoi(12.*(x.xy-.01*n), v, vi);
    v = abs(v/12.)-.001;
    
    float d;
    zextrude(x.z, -v, .001, d);
    smoothmin(d, x.z, .02, d);
    
    
    sdf = vec2(d, 1.);
}

void normal(in vec3 x, out vec3 n, in float dx)
{
    vec2 s, na;
    
    scene(x,s);
    scene(x+dx*c.xyy, na);
    n.x = na.x;
    scene(x+dx*c.yxy, na);
    n.y = na.x;
    scene(x+dx*c.yyx, na);
    n.z = na.x;
    n = normalize(n-s.x);
}

float sm(in float d)
{
    return smoothstep(1.5/iResolution.y, -1.5/iResolution.y, d);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.yy,
        s;
    vec3 o0 = c.yyx,
        o = o0,
        r = c.xyy,
        t = c.yyy, 
        u = cross(normalize(t-o),r),
        dir,
        n, 
        x,
        c1 = c.yyy,
        l,
        col = c.yyy;
    int N = 450,
        i;

    t = uv.x * r + uv.y * u;
    dir = normalize(t-o);
    
    float d = .0;
    
    // Raymarch branch
    for(i = 0; i<N; ++i)
    {
        x = o + d * dir;
        scene(x,s);
        if(s.x < 1.e-4) break;
        //d += s.x<1.e-1?min(s.x,5.e-2):s.x;
        d += min(s.x, 5.e-3);
        //d += s.x;
    }
    float v, vc;
    vec2 vi;
    
    float na;
    lfnoise(12.*x.z*c.xx, na);
    na = .5+.5*na;
    
    if(i<N)
    {
        normal(x, n, 5.e-4);
        l = normalize(x+.1*n);
        
        if(s.y == 0.) // Tunnel wall
        {
            col = mix(vec3(0.75,0.11,0.11),vec3(0.47,1.00,0.00), na);
            col = mix(col, 4.*vec3(0.87,0.01,0.38)*col, clamp(length(x),0.,1.));
            col = mix(col, vec3(0.22,0.31,0.71), clamp(.5*abs(dot(n,c.xxx)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + 1.4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
        
        if(s.y == 1.) // Glowshit
        {
            col = vec3(0.20,0.99,0.04);
            col = mix(col, vec3(0.22,0.31,0.71), clamp(.5*abs(dot(n,c.xxx)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + 1.4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
        if(s.y == 2.) // Glowshit 2
        {
            col = vec3(0.27,0.04,0.73);
            col = mix(col, vec3(0.22,0.31,0.71), clamp(.5*abs(dot(n,c.xxx)),0.,1.));
            col = .1*col 
                + .2*col*dot(l, n)
                + 1.4*col*pow(abs(dot(reflect(l,n),dir)),2.);
        }
    }
    
    fragColor = vec4(col,1.0);
}
