"use client";

import { IconShare3 } from "@tabler/icons-react";
import Button from "../buttons/Button";
import UserShareModal from "../common/UserShareModal";

interface MembershipShareButtonProps {
  fullName?: string;
  username?: string;
  avatar?: string;
  memberCard?: string;
  registrationNumber?: number;
  className?: string;
}

export default function MembershipShareButton({
  className,
  ...shareProps
}: MembershipShareButtonProps) {
  return (
    <UserShareModal
      {...shareProps}
      renderTrigger={(openModal) => (
        <Button
          variant="secondarySoft"
          className={className}
          onClick={openModal}
        >
          <IconShare3 className="size-4" stroke={2} />
          Bagikan
        </Button>
      )}
    />
  );
}
