CC = gcc
CFLAGS = -Wall -Wextra -pedantic -g -Iinclude
LDFLAGS = -lreadline -lncurses
GTK_CFLAGS = `pkg-config --cflags gtk+-3.0 vte-2.91`
GTK_LIBS = `pkg-config --libs gtk+-3.0 vte-2.91`

SRCS = src/main.c src/builtins.c src/parser.c src/executor.c src/jobs.c \
       src/expand.c src/alias.c src/variables.c src/substitute.c src/rc.c \
       src/arith.c src/array.c src/test.c
OBJS = $(SRCS:.c=.o)
TARGET_CLI = codehub_shell
TARGET_GUI = codehub_gui
GUI_SRC = src/gui.c

all: $(TARGET_CLI) $(TARGET_GUI)

$(TARGET_CLI): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

$(TARGET_GUI): $(GUI_SRC)
	$(CC) $(CFLAGS) $(GTK_CFLAGS) -o $@ $< $(GTK_LIBS)

clean:
	rm -f $(OBJS) $(TARGET_CLI) $(TARGET_GUI)

.PHONY: all clean
