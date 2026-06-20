#include "shell.h"

void load_rc_file(void) {
    char *home = getenv("HOME");
    if (!home) return;
    char path[strlen(home) + 20];
    sprintf(path, "%s/.codehubrc", home);
    FILE *fp = fopen(path, "r");
    if (!fp) {
        fp = fopen(path, "w");
        if (fp) {
            fprintf(fp, "# codehub_shell rc file\n");
            fclose(fp);
        }
        return;
    }
    alias_load_from_file(fp);
    fclose(fp);
}
