// tracker.h
#ifndef TRACKER_H
#define TRACKER_H

#include <stdint.h>
#include <stdbool.h>

#define TRACKER_MAX_TARGETS 5

typedef enum {
    TRACKER_OK = 0,
    TRACKER_INVALID_INPUT,
    TRACKER_NO_FREE_SLOT,
    TRACKER_TARGET_NOT_FOUND,
    TRACKER_ERROR
} tracker_error_t;

typedef struct {
    uint16_t x;
    uint16_t y;
    uint16_t width;
    uint16_t height;
} tracker_bbox_t;

typedef struct {
    bool active;
    uint8_t target_id;
    tracker_bbox_t raw;
    tracker_bbox_t smoothed;
    float kf_x[2];
    float kf_y[2];
    float kf_w[2];
    float kf_h[2];
    float p_x[2][2];
    float p_y[2][2];
    float p_w[2][2];
    float p_h[2][2];
    uint32_t last_update_ms;
} tracker_target_t;

typedef struct {
    tracker_target_t targets[TRACKER_MAX_TARGETS];
    uint32_t time_ms;
} tracker_t;

void tracker_init(tracker_t *tracker);
tracker_error_t tracker_update(tracker_t *tracker, uint8_t target_id, const tracker_bbox_t *detection, uint32_t timestamp_ms);
tracker_error_t tracker_predict(tracker_t *tracker, uint32_t timestamp_ms);
tracker_error_t tracker_get_smoothed(tracker_t *tracker, uint8_t target_id, tracker_bbox_t *output);
tracker_error_t tracker_remove_target(tracker_t *tracker, uint8_t target_id);

#endif
