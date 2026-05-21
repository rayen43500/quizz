interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 36, md: 44, lg: 64, xl: 96 };

export default function Avatar({ src, firstName = '', lastName = '', size = 'md' }: AvatarProps) {
  const px = SIZES[size];
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={`avatar avatar-${size}`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span className={`avatar avatar-fallback avatar-${size}`} style={{ width: px, height: px, fontSize: px * 0.35 }}>
      {initials}
    </span>
  );
}
