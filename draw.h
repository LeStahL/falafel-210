#ifndef DRAW_HEADER
#define DRAW_HEADER

if(t < t_vortexlogo)
{
    glUseProgram(shader_program_gfx_leaf.handle);
    glUniform1f(shader_uniform_gfx_leaf_iTime, t-t_leaf);
    glUniform2f(shader_uniform_gfx_leaf_iResolution, w, h);
#ifdef MIDI
    glUniform1f(shader_uniform_gfx_leaf_iFader0, fader0);
    glUniform1f(shader_uniform_gfx_leaf_iFader1, fader1);
    glUniform1f(shader_uniform_gfx_leaf_iFader2, fader2);
    glUniform1f(shader_uniform_gfx_leaf_iFader3, fader3);
    glUniform1f(shader_uniform_gfx_leaf_iFader4, fader4);
    glUniform1f(shader_uniform_gfx_leaf_iFader5, fader5);
    glUniform1f(shader_uniform_gfx_leaf_iFader6, fader6);
    glUniform1f(shader_uniform_gfx_leaf_iFader7, fader7);
#endif
}
else if(t < t_fractal)
{
    glUseProgram(shader_program_gfx_vortexlogo.handle);
    glUniform1f(shader_uniform_gfx_vortexlogo_iTime, t-t_vortexlogo);
    glUniform2f(shader_uniform_gfx_vortexlogo_iResolution, w, h);
#ifdef MIDI
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader0, fader0);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader1, fader1);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader2, fader2);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader3, fader3);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader4, fader4);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader5, fader5);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader6, fader6);
    glUniform1f(shader_uniform_gfx_vortexlogo_iFader7, fader7);
#endif
}
else {
    glUseProgram(shader_program_gfx_fractal.handle);
    glUniform1f(shader_uniform_gfx_fractal_iTime, t-t_fractal);
    glUniform2f(shader_uniform_gfx_fractal_iResolution, w, h);
#ifdef MIDI
    glUniform1f(shader_uniform_gfx_fractal_iFader0, fader0);
    glUniform1f(shader_uniform_gfx_fractal_iFader1, fader1);
    glUniform1f(shader_uniform_gfx_fractal_iFader2, fader2);
    glUniform1f(shader_uniform_gfx_fractal_iFader3, fader3);
    glUniform1f(shader_uniform_gfx_fractal_iFader4, fader4);
    glUniform1f(shader_uniform_gfx_fractal_iFader5, fader5);
    glUniform1f(shader_uniform_gfx_fractal_iFader6, fader6);
    glUniform1f(shader_uniform_gfx_fractal_iFader7, fader7);
#endif
}
#endif
