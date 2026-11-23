import React from "react";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  // Chia nội dung thành các khối đoạn văn bản theo dòng trống
  const blocks = content.split(/\n\s*\n/);

  // Xử lý các định dạng inline: **in đậm** và [liên kết](url)
  const renderInline = (text: string) => {
    // Tách các đoạn **in đậm**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-[#292524]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-[#373523] leading-relaxed text-sm sm:text-base">
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Tiêu đề cấp 1 (# Heading 1)
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={blockIdx} className="text-2xl sm:text-3xl font-bold text-[#292524] mt-6 mb-2 tracking-tight">
              {renderInline(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        // Tiêu đề cấp 2 (## Heading 2)
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={blockIdx} className="text-xl sm:text-2xl font-bold text-[#292524] mt-6 mb-2 border-b border-[#EDE5D5] pb-2 tracking-tight">
              {renderInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Tiêu đề cấp 3 (### Heading 3)
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={blockIdx} className="text-base sm:text-lg font-bold text-[#292524] mt-6 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#F4CD65] rounded-full inline-block shrink-0" />
              <span>{renderInline(trimmed.replace(/^###\s+/, ""))}</span>
            </h3>
          );
        }

        // Tiêu đề cấp 4 (#### Heading 4)
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={blockIdx} className="text-sm sm:text-base font-bold text-[#292524] mt-4 mb-1">
              {renderInline(trimmed.replace(/^####\s+/, ""))}
            </h4>
          );
        }

        // Trích dẫn (> Blockquote)
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={blockIdx} className="border-l-4 border-[#F4CD65] pl-4 py-2 italic bg-[#FFF7E5]/50 rounded-r-2xl text-[#57534E]">
              {renderInline(trimmed.replace(/^>\s+/, ""))}
            </blockquote>
          );
        }

        // Danh sách gạch đầu dòng (- hoặc *)
        const lines = trimmed.split("\n");
        const isBulletList = lines.every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "));
        if (isBulletList) {
          return (
            <ul key={blockIdx} className="space-y-2 pl-2 sm:pl-3 my-2">
              {lines.map((line, lineIdx) => (
                <li key={lineIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#805B10] mt-2 shrink-0" />
                  <span className="flex-1 leading-relaxed">
                    {renderInline(line.trim().replace(/^[-*]\s+/, ""))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Đoạn văn bản thông thường (Paragraph)
        return (
          <p key={blockIdx} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
