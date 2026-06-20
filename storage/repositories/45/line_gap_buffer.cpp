#include "line_gap_buffer.h"
#include <sstream>

LineGapBuffer::LineGapBuffer() {
    lines.push_back("");
}

void LineGapBuffer::insertLine(size_t pos, const std::string &text) {
    if (pos > lines.size()) pos = lines.size();
    lines.insert(lines.begin() + pos, text);
}

void LineGapBuffer::deleteLine(size_t pos) {
    if (pos < lines.size() && lines.size() > 1) {
        lines.erase(lines.begin() + pos);
    }
}

std::string &LineGapBuffer::line(size_t pos) {
    return lines[pos];
}

const std::string &LineGapBuffer::line(size_t pos) const {
    return lines[pos];
}

size_t LineGapBuffer::lineCount() const {
    return lines.size();
}

size_t LineGapBuffer::charCount() const {
    size_t total = 0;
    for (const auto &l : lines) total += l.size();
    return total;
}

void LineGapBuffer::insertChar(size_t line, size_t col, char c) {
    if (line >= lines.size()) return;
    if (col > lines[line].size()) col = lines[line].size();
    lines[line].insert(lines[line].begin() + col, c);
}

void LineGapBuffer::deleteChar(size_t line, size_t col) {
    if (line >= lines.size()) return;
    if (col < lines[line].size()) {
        lines[line].erase(lines[line].begin() + col);
    }
}

void LineGapBuffer::setContent(const std::string &content) {
    lines.clear();
    std::istringstream iss(content);
    std::string line;
    while (std::getline(iss, line)) {
        lines.push_back(line);
    }
    if (lines.empty()) lines.push_back("");
}

std::string LineGapBuffer::getContent() const {
    std::string result;
    for (size_t i = 0; i < lines.size(); ++i) {
        result += lines[i];
        if (i + 1 < lines.size()) result += '\n';
    }
    return result;
}
