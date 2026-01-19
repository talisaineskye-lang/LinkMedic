"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-gray-700">{user.name || user.email}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}
