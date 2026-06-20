// tracker.c
#include "tracker.h"
#include <string.h>

static void kalman_init(float *x, float p[2][2], float initial_value);
static void kalman_predict(float *x, float p[2][2]);
static void kalman_update(float *x, float p[2][2], float measurement, float measurement_noise);

void tracker_init(tracker_t *tracker) {
    memset(tracker->targets, 0, sizeof(tracker->targets));
    tracker->time_ms = 0;
}

tracker_error_t tracker_update(tracker_t *tracker, uint8_t target_id, const tracker_bbox_t *detection, uint32_t timestamp_ms) {
    if (!tracker || !detection) return TRACKER_INVALID_INPUT;
    tracker_target_t *tgt = NULL;
    int free_slot = -1;
    for (int i = 0; i < TRACKER_MAX_TARGETS; i++) {
        if (tracker->targets[i].active && tracker->targets[i].target_id == target_id) {
            tgt = &tracker->targets[i];
            break;
        }
        if (!tracker->targets[i].active && free_slot == -1) {
            free_slot = i;
        }
    }
    if (!tgt) {
        if (free_slot == -1) return TRACKER_NO_FREE_SLOT;
        tgt = &tracker->targets[free_slot];
        tgt->active = true;
        tgt->target_id = target_id;
        kalman_init(tgt->kf_x, tgt->p_x, (float)detection->x);
        kalman_init(tgt->kf_y, tgt->p_y, (float)detection->y);
        kalman_init(tgt->kf_w, tgt->p_w, (float)detection->width);
        kalman_init(tgt->kf_h, tgt->p_h, (float)detection->height);
    }
    tgt->raw = *detection;
    kalman_update(tgt->kf_x, tgt->p_x, (float)detection->x, 10.0f);
    kalman_update(tgt->kf_y, tgt->p_y, (float)detection->y, 10.0f);
    kalman_update(tgt->kf_w, tgt->p_w, (float)detection->width, 20.0f);
    kalman_update(tgt->kf_h, tgt->p_h, (float)detection->height, 20.0f);
    tgt->smoothed.x = (uint16_t)(tgt->kf_x[0] + 0.5f);
    tgt->smoothed.y = (uint16_t)(tgt->kf_y[0] + 0.5f);
    tgt->smoothed.width = (uint16_t)(tgt->kf_w[0] + 0.5f);
    tgt->smoothed.height = (uint16_t)(tgt->kf_h[0] + 0.5f);
    tgt->last_update_ms = timestamp_ms;
    return TRACKER_OK;
}

tracker_error_t tracker_predict(tracker_t *tracker, uint32_t timestamp_ms) {
    if (!tracker) return TRACKER_INVALID_INPUT;
    for (int i = 0; i < TRACKER_MAX_TARGETS; i++) {
        if (tracker->targets[i].active) {
            kalman_predict(tracker->targets[i].kf_x, tracker->targets[i].p_x);
            kalman_predict(tracker->targets[i].kf_y, tracker->targets[i].p_y);
            kalman_predict(tracker->targets[i].kf_w, tracker->targets[i].p_w);
            kalman_predict(tracker->targets[i].kf_h, tracker->targets[i].p_h);
        }
    }
    tracker->time_ms = timestamp_ms;
    return TRACKER_OK;
}

tracker_error_t tracker_get_smoothed(tracker_t *tracker, uint8_t target_id, tracker_bbox_t *output) {
    if (!tracker || !output) return TRACKER_INVALID_INPUT;
    for (int i = 0; i < TRACKER_MAX_TARGETS; i++) {
        if (tracker->targets[i].active && tracker->targets[i].target_id == target_id) {
            *output = tracker->targets[i].smoothed;
            return TRACKER_OK;
        }
    }
    return TRACKER_TARGET_NOT_FOUND;
}

tracker_error_t tracker_remove_target(tracker_t *tracker, uint8_t target_id) {
    if (!tracker) return TRACKER_INVALID_INPUT;
    for (int i = 0; i < TRACKER_MAX_TARGETS; i++) {
        if (tracker->targets[i].active && tracker->targets[i].target_id == target_id) {
            tracker->targets[i].active = false;
            return TRACKER_OK;
        }
    }
    return TRACKER_TARGET_NOT_FOUND;
}

static void kalman_init(float *x, float p[2][2], float initial_value) {
    x[0] = initial_value;
    x[1] = 0.0f;
    p[0][0] = 1000.0f;
    p[0][1] = 0.0f;
    p[1][0] = 0.0f;
    p[1][1] = 1000.0f;
}

static void kalman_predict(float *x, float p[2][2]) {
    x[0] = x[0] + x[1];
    p[0][0] = p[0][0] + 2.0f * p[0][1] + p[1][1] + 1.0f;
    p[0][1] = p[0][1] + p[1][1];
    p[1][0] = p[1][0] + p[1][1];
    p[1][1] = p[1][1] + 1.0f;
}

static void kalman_update(float *x, float p[2][2], float measurement, float measurement_noise) {
    float s = p[0][0] + measurement_noise;
    float k0 = p[0][0] / s;
    float k1 = p[1][0] / s;
    float y = measurement - x[0];
    x[0] = x[0] + k0 * y;
    x[1] = x[1] + k1 * y;
    float p00 = p[0][0] - k0 * p[0][0];
    float p01 = p[0][1] - k0 * p[0][1];
    p[1][0] = p[1][0] - k1 * p[0][0];
    p[1][1] = p[1][1] - k1 * p[0][1];
    p[0][0] = p00;
    p[0][1] = p01;
}
