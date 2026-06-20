#include "editor.h"

int main(int argc, char *argv[]) {
    Editor ed;
    if (argc >= 2) ed.loadFile(argv[1]);
    ed.run();
    return 0;
}
