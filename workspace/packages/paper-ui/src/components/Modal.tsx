// Modal — 종이 위로 뜬 쪽지. 이 시스템에서 그림자를 갖는 몇 안 되는 자리.
//
// 접근성: 열리면 포커스가 다이얼로그로 들어가고, Tab 이 그 안에서만 돈다(트랩). 배경은
// inert 로 잠가(키보드·스크린리더 차단) body 스크롤도 막고, 닫히면 포커스가 열기 전
// 자리로 돌아간다. 배경을 통째로 끄려면 다이얼로그가 배경 밖에 있어야 해서 body 로
// portal 한다 — 그러면 backdrop 이 body 의 형제가 되고, 나머지 형제만 inert 로 끈다.

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Box, Stack, Inline, Text } from "../primitives";
import { Button, Divider } from "../atoms";
import { modalBackdrop, modalPanel, modalStack, modalBody } from "./Modal.css";

export type ModalProps = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

// 다이얼로그 안에서 Tab 이 닿을 수 있는 것들 — 트랩이 이 목록의 양 끝을 이어 붙인다.
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export const Modal = ({ open, title, onClose, children, footer }: ModalProps) => {
  const mid = useId();
  const titleId = `${mid}-title`;

  // 포커스 진입·배경 inert·스크롤 락 — open 전환에만 걸어 부모 리렌더로 포커스를 뺏지 않는다.
  useEffect(() => {
    if (!open) return;
    const backdrop = document.getElementById(mid);
    const panel = backdrop?.querySelector<HTMLElement>('[role="dialog"]') ?? null;
    const prevActive = document.activeElement as HTMLElement | null;

    // body 의 다른 형제(우리 backdrop 제외)를 통째로 inert — 이미 꺼진 건 건드리지 않는다.
    const inerted: HTMLElement[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el !== backdrop && !el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el as HTMLElement);
      }
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      for (const el of inerted) el.removeAttribute("inert");
      // 열기 전 자리로 포커스 복귀 (트리거로).
      prevActive?.focus?.();
    };
  }, [open, mid]);

  // Esc 로 닫고, Tab 을 다이얼로그 안에서 순환시킨다. onClose 가 매번 새로 와도 여기선
  // 리스너만 다시 걸릴 뿐이라(포커스 안 건드림) 안전하다.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const backdrop = document.getElementById(mid);
      const panel = backdrop?.querySelector<HTMLElement>('[role="dialog"]');
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      // 포커서블이 없으면 패널 자신에 가둔다.
      if (f.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === panel) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, mid]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <Box id={mid} className={modalBackdrop} onClick={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        surface="raised"
        radius="lg"
        shadow="overlay"
        className={modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목·푸터는 붙박이고 본문만 구른다 — 패널에 높이 상한이 있어서다(Modal.css). */}
        <Stack className={modalStack}>
          <Box padding="lg">
            <Text id={titleId} variant="heading">
              {title}
            </Text>
          </Box>
          <Divider />
          <Box padding="lg" className={modalBody}>
            {children}
          </Box>
          <Divider />
          <Inline padding="md" gap="sm" justify="end">
            {footer ?? (
              <Button variant="quiet" onClick={onClose}>
                닫기
              </Button>
            )}
          </Inline>
        </Stack>
      </Box>
    </Box>,
    document.body,
  );
};
