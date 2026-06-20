#include "gap_buffer.h"
#include <algorithm>

GapBuffer::GapBuffer() : cursor(0), gapStart(0), gapEnd(0) {}

void GapBuffer::insert(char c) {
    if (gapStart == gapEnd) {
        size_t newSize = buffer.size() * 2 + 1;
        std::vector<char> nb(newSize);
        std::copy(buffer.begin(), buffer.begin() + gapStart, nb.begin());
        std::copy(buffer.begin() + gapEnd, buffer.end(), nb.begin() + gapStart + (newSize - buffer.size()));
        size_t oldEnd = gapEnd;
        gapEnd = gapStart + (newSize - buffer.size());
        buffer.swap(nb);
        std::copy(buffer.begin() + gapStart + (newSize - buffer.size()), buffer.end(),
                  buffer.begin() + gapStart + (newSize - buffer.size()));
    }
    buffer[gapStart++] = c;
    ++cursor;
}

void GapBuffer::erase() {
    if (cursor > 0 && gapStart > 0) {
        buffer[--gapStart] = 0;
        --cursor;
    }
}

void GapBuffer::deleteChar() {
    if (cursor < size() - (gapEnd - gapStart) && gapEnd < buffer.size()) {
        ++gapEnd;
    }
}

void GapBuffer::moveLeft() {
    if (cursor > 0 && gapStart > 0) {
        buffer[--gapEnd] = buffer[--gapStart];
        --cursor;
    }
}

void GapBuffer::moveRight() {
    if (cursor < size() - (gapEnd - gapStart) && gapEnd < buffer.size()) {
        buffer[gapStart++] = buffer[gapEnd++];
        ++cursor;
    }
}

void GapBuffer::moveUp(int cols) {
    int line = cursor / (cols + 1);
    if (line > 0) {
        int col = cursor % (cols + 1);
        int target = (line - 1) * (cols + 1) + col;
        if (target > (int)size()) target = size();
        while ((int)cursor > target) moveLeft();
        while ((int)cursor < target) moveRight();
    }
}

void GapBuffer::moveDown(int cols) {
    int line = cursor / (cols + 1);
    int totalLines = size() / (cols + 1);
    if (line < totalLines) {
        int col = cursor % (cols + 1);
        int target = (line + 1) * (cols + 1) + col;
        if (target > (int)size()) target = size();
        while ((int)cursor > target) moveLeft();
        while ((int)cursor < target) moveRight();
    }
}

std::string GapBuffer::content() const {
    std::string s;
    s.reserve(size());
    for (size_t i = 0; i < gapStart; ++i) s.push_back(buffer[i]);
    for (size_t i = gapEnd; i < buffer.size(); ++i) s.push_back(buffer[i]);
    return s;
}

void GapBuffer::setContent(const std::string &text) {
    buffer.assign(text.begin(), text.end());
    gapStart = buffer.size();
    gapEnd = buffer.size();
    cursor = 0;
}

size_t GapBuffer::size() const { return buffer.size() - (gapEnd - gapStart); }
size_t GapBuffer::pos() const { return cursor; }
