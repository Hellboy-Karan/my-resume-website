const badgeStyles = {
  ADMIN: 'bg-red-100 text-red-700 ring-red-200',
  SUB_ADMIN: 'bg-orange-100 text-orange-700 ring-orange-200',
  USER: 'bg-blue-100 text-blue-700 ring-blue-200'
};

const labels = {
  ADMIN: 'Admin',
  SUB_ADMIN: 'Sub Admin',
  USER: 'User'
};

export default function RoleBadge({ role }) {
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-black ring-1 ${badgeStyles[role] || badgeStyles.USER}`}>
      {labels[role] || 'User'}
    </span>
  );
}

