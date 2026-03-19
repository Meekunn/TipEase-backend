const defaultAvatars = [
  "https://res.cloudinary.com/do8z7sapx/image/upload/v1773313676/default_avatar_1_bpejbk.png",
  "https://res.cloudinary.com/do8z7sapx/image/upload/v1773313675/default_avatar_2_xkrhgu.png",
  "https://res.cloudinary.com/do8z7sapx/image/upload/v1773313675/default_avatar_3_amkzys.png",
];

export const getRandomAvatar = (): string => {
  return (
    defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)] ??
    defaultAvatars[0]!
  );
};
