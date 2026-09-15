import Label from "../common/Label";
import LogoHmi from "../svg/LogoHmi";
import LogoKahmi from "../svg/LogoKahmi";

// The HMI emblem is a tall crest, not a square — keep its ratio instead of forcing it into a box.
const HMI_ASPECT_RATIO = 665 / 1768;

interface AlumniStatusLabelProps {
  // users/detail's is_alumni — a member who has left active membership (KAHMI).
  isAlumni?: boolean;
  iconSize?: number;
}

export default function AlumniStatusLabel({
  isAlumni,
  iconSize = 14,
}: AlumniStatusLabelProps) {
  if (isAlumni) {
    return (
      <Label
        variant="gray"
        // border-radius on an inline <svg> doesn't reliably clip it, so the square emblem gets a real mask.
        icon={
          <span
            className="inline-flex shrink-0 overflow-hidden rounded-full"
            style={{ width: iconSize, height: iconSize }}
          >
            <LogoKahmi width={iconSize} height={iconSize} aria-hidden="true" />
          </span>
        }
      >
        Alumni
      </Label>
    );
  }

  return (
    <Label
      variant="gray"
      icon={
        <LogoHmi
          width={iconSize * HMI_ASPECT_RATIO}
          height={iconSize}
          className="shrink-0"
          aria-hidden="true"
        />
      }
    >
      Kader
    </Label>
  );
}
