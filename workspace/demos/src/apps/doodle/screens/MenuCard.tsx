import { useState } from "react";

import { Button, Floating, IconButton, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { useButtonFace } from "../parts/face";

export const MenuCard = ({ onHome }: { onHome: () => void }) => {
  const buttonFace = useButtonFace();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  return (
    <Floating open={open} onOpenChange={setOpen}>
      <IconButton as={Floating.Trigger} size="lg" {...buttonFace} aria-label="메뉴"><Glyph name="menu" /></IconButton>
      <Floating.Content as={Surface} fill="raised" border radius="md" padding="lg" placement="top start" offset="sm" aria-label="작업 공간 메뉴">
        <Stack gap="md" width="lg">
          <Stack gap="xs">
            <Text as="p" strong>doodle prototype</Text>
            <Text as="p" variant="caption" ink="tertiary">생각을 펼치는 개인 작업 공간</Text>
          </Stack>
          <Stack gap="sm">
            <Button size="sm" variant="soft" fullWidth aria-expanded={account} onClick={() => setAccount((now) => !now)}>계정 및 작업 공간</Button>
            {account ? (
              <Text as="p" variant="label" strong={false} ink="tertiary">
                현재는 게스트 작업 공간입니다. 로그인 기능은 아직 연결되지 않았으며, 이 브라우저에 내용이 저장됩니다.
              </Text>
            ) : null}
            <Button size="sm" variant="soft" fullWidth onClick={() => { onHome(); setOpen(false); }}><Glyph name="rotate-ccw" />화면 중심으로</Button>
          </Stack>
          <Text as="p" variant="label" strong={false} ink="tertiary">이 프로토타입의 데이터는 이 브라우저에 저장됩니다.</Text>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
