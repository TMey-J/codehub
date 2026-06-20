// main_demo.c
#include "tracker.h"
#include <stdio.h>

int main(void) {
    tracker_t tracker;
    tracker_init(&tracker);
    tracker_bbox_t det = {100, 200, 30, 40};
    tracker_update(&tracker, 1, &det, 0);
    tracker_predict(&tracker, 10);
    tracker_bbox_t out;
    tracker_get_smoothed(&tracker, 1, &out);
    printf("Smoothed: x=%u y=%u w=%u h=%u\n", out.x, out.y, out.width, out.height);
    tracker_remove_target(&tracker, 1);
    return 0;
}
