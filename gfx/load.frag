#version 130
/*
 * sunnel for falael, maybe, by lemique of team210
 * 
 */

// iProgress in [0,1], dont use iTime
//  change in the first section of void mainImage

uniform float iProgress;
uniform vec2 iResolution;

out vec4 gl_FragColor;

const float pi = acos(-1.);

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // define prog
    float prog = iProgress;
    float micprog = 8.0*prog-4.0;
    
    // turn coordinates
    float crdangle = 2.0*pi*prog;
    mat2 turncrd = mat2(cos(crdangle),sin(crdangle),-sin(crdangle),cos(crdangle));
    
    // New coordinates, y = [-1, 1], x proportional / rp: radius [0,1..], phi lefthanded from top [0,16]
    vec2 uv = turncrd*vec2((fragCoord.x-0.5*iResolution.x)/(0.5*iResolution.y), fragCoord.y/(0.5*iResolution.y)-1.0);
    vec2 rp = vec2(sqrt(uv.x*uv.x + uv.y*uv.y), 8.0/pi*atan(uv.x/uv.y));
    float modphi = mod(rp.y, 2.0);
    float restphi = rp.y-modphi;
    
    float angle = 0.125*pi*(1.0+restphi);
    mat2 turn = mat2(cos(angle),sin(angle),-sin(angle),cos(angle));
    vec2 uvturn = turn*uv;
    
    // Colors
    vec3 bck = vec3(0.2, 0.7, 0.9);  // maybe stars as background would be nice with color-shift
    vec3 empty1 = vec3(1.0, 0.0, 0.0);
    vec3 empty2 = vec3(1.0,1.0,0.0);
    vec3 loaded1 = vec3(1.0, 0.0, 1.0);
    vec3 loaded2 = vec3(0.0, 1.0, 1.0);
    vec3 line = vec3(0.0, 1.0, 0.2);

    vec3 col = bck;

    // windmill
    if (rp.y>micprog){      // not already loaded
        if (modphi<1.0){
            if (abs(uvturn.x)+abs(uvturn.y)<1.0) col = empty1;//mix(empty1, empty2, pow((2.0*modphi-1.0),50.0));
            else if (abs(uvturn.x)+abs(uvturn.y)<1.02) col=mix(empty1, line, (abs(uvturn.x)+abs(uvturn.y)-1.0)*50.0);
            else if (abs(uvturn.x)+abs(uvturn.y)<1.04) col=mix(line, bck, (abs(uvturn.x)+abs(uvturn.y)-1.02)*50.0);
        }
        else if (modphi<2.0){
            if (abs(uvturn.x)+abs(uvturn.y)<1.0) col = mix(empty2, empty1, pow((2.0*modphi-3.0),50.0));
            else if (abs(uvturn.x)+abs(uvturn.y)<1.02) col=mix(empty2, line, (abs(uvturn.x)+abs(uvturn.y)-1.0)*50.0);
            else if (abs(uvturn.x)+abs(uvturn.y)<1.04) col=mix(line, bck, (abs(uvturn.x)+abs(uvturn.y)-1.02)*50.0);
        }
    }
    else{                      // already loaded
        if (modphi<1.0){
            if (abs(uvturn.x)+abs(uvturn.y)<1.0) col = loaded1;//mix(loaded1, line, pow((2.0*modphi-1.0),10.0));
            else if (abs(uvturn.x)+abs(uvturn.y)<1.02) col=mix(loaded1, line, (abs(uvturn.x)+abs(uvturn.y)-1.0)*50.0);
            else if (abs(uvturn.x)+abs(uvturn.y)<1.04) col=mix(line, bck, (abs(uvturn.x)+abs(uvturn.y)-1.02)*50.0);
        }
        else if (modphi<2.0){
            if (abs(uvturn.x)+abs(uvturn.y)<1.0) col = mix(loaded2, loaded1, pow((2.0*modphi-3.0),50.0));
            else if (abs(uvturn.x)+abs(uvturn.y)<1.02) col=mix(loaded2, line, (abs(uvturn.x)+abs(uvturn.y)-1.0)*50.0);
            else if (abs(uvturn.x)+abs(uvturn.y)<1.04) col=mix(line, bck, (abs(uvturn.x)+abs(uvturn.y)-1.02)*50.0);
        }
    }
    // maybe load quantisized (<- I know english quite well)
    
    
    
    
    
    // black hole
    if (rp.x<0.005) col = vec3(0.0, 0.0, 0.0);
    
    
    // Output to screen
    fragColor = vec4(col,1.0);
}

void main()
{
	mainImage(gl_FragColor, gl_FragCoord.xy);
}

