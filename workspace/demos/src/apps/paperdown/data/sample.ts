import { NOW } from "../../../kit";
import { markdownToHtml } from "../lib/markdown";
import { DEFAULT_SETTINGS, type DocumentData } from "../lib/types";

export const SAMPLE_MARKDOWN = `# 생각을 담는 한 장

문장을 쓰는 동안, 문서는 이미 완성된 모습입니다. **Paperdown**은 글의 흐름과 종이의 형태를 함께 다루는 공간입니다.

## 글에 집중하세요

이 문장을 클릭하고 바로 써보세요. 텍스트를 선택하면 위 도구 모음에서 **굵게**, *기울임*, 서체와 크기를 바꿀 수 있습니다. Markdown 문법으로 제목과 목록을 만들 수도 있습니다.

> 잘 정돈된 종이는 다음 생각을 기다립니다.

## 원하는 모습으로 남기세요

- 명조와 Pretendard, 글에 어울리는 서체
- A4부터 자유 크기까지, 페이지 옵션
- 이미지 복사와 PNG · PDF 다운로드

문서 파일에는 서식과 이미지까지 함께 저장됩니다.

---

첫 문장부터, 마지막 한 장까지.
`;

export const sampleDocument = (): DocumentData => ({
  id: "local",
  title: "새로운 문서",
  html: markdownToHtml(SAMPLE_MARKDOWN),
  settings: DEFAULT_SETTINGS,
  updatedAt: NOW.getTime(),
});

export const emptyDocument = (id: string, title = "새로운 문서", settings = DEFAULT_SETTINGS): DocumentData => ({ id, title, html: "<p></p>", settings, updatedAt: Date.now() });

export const emptyNote = (id: string): DocumentData => ({ ...emptyDocument(id, "새로운 노트"), html: "<h1></h1><p></p>" });
