/**
 * Thin-stroke line icons shared across the storefront. They inherit
 * `currentColor`, so colour is always set from CSS.
 */
function Icon({ size = 20, strokeWidth = 1.4, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const BagIcon = (p) => (
  <Icon {...p}>
    <path d="M5 8h14l-1.1 11.2a2 2 0 0 1-2 1.8H8.1a2 2 0 0 1-2-1.8L5 8z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Icon>
)

export const HeartIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.5 2.7C19.5 15.6 12 20 12 20z" />
  </Icon>
)

export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Icon>
)

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
)

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
)

export const TruckIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6.5h11v9H3zM14 9.5h3.6l3.4 3.4v2.6h-7" />
    <circle cx="7" cy="17.5" r="1.7" />
    <circle cx="17" cy="17.5" r="1.7" />
  </Icon>
)

export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
)

export const ReturnIcon = (p) => (
  <Icon {...p}>
    <path d="M9 14 4.5 9.5 9 5" />
    <path d="M4.5 9.5H15a4.5 4.5 0 0 1 0 9h-4" />
  </Icon>
)

export const SparkleIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5z" />
    <path d="M18.5 15.5c.25 1.6.9 2.25 2.5 2.5-1.6.25-2.25.9-2.5 2.5-.25-1.6-.9-2.25-2.5-2.5 1.6-.25 2.25-.9 2.5-2.5z" />
  </Icon>
)

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)
