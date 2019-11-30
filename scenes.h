#ifndef SCENES_HEADER
#define SCENES_HEADER

#define t_leaf (0)
#define t_vortexlogo (30)
#define t_fractal (70)
#define duration (100)

const double start_times[] = {
    t_leaf,
    t_vortexlogo,
    t_fractal,
};

const char *scene_names[] = {
    "Leaf",
    "Vortex Scene",
    "Fractal",
};

const unsigned int nscenes = ARRAYSIZE(start_times);

// We need these two arrays to always have the same size - the following line will cause a compiler error if this is ever not the case
_STATIC_ASSERT(ARRAYSIZE(start_times) == ARRAYSIZE(scene_names));

#endif
