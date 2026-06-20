# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(tracker C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Wpedantic -Werror -mcpu=cortex-m4 -mthumb -Os")

add_library(tracker STATIC tracker.c)
target_include_directories(tracker PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_executable(tracker_demo main_demo.c)
target_link_libraries(tracker_demo tracker)
