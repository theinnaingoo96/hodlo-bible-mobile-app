if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/bluestone/.gradle/caches/8.13/transforms/2c9e90b2c1c0c4ca243c277b6aa25320/transformed/jetified-hermes-android-0.79.2-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/bluestone/.gradle/caches/8.13/transforms/2c9e90b2c1c0c4ca243c277b6aa25320/transformed/jetified-hermes-android-0.79.2-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

