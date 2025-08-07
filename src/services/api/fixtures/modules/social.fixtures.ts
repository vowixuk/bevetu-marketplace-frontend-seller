import { IViewCommentsReturn, IViewPostReturn, IViewPostsReturn } from "../../types/social-services.types";

export const viewCommentsReturn: IViewCommentsReturn = {
  comments: [
    {
      id: "comment_001",
      userId: "user_001",
      username: "JohnDoe",
      profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      text: "This is an amazing post! Really enjoyed it.",
      createdAt: "2024-10-15T10:20:30Z",
      likesCount: 5,
      isLikedByCurrentUser: true,
    },
    {
      id: "comment_002",
      userId: "user_002",
      username: "JaneSmith",
      profileImageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
      text: "I completely agree with this!",
      createdAt: "2024-10-15T12:15:40Z",
      likesCount: 12,
      isLikedByCurrentUser: false,
    },
    {
      id: "comment_003",
      userId: "user_003",
      username: "AlexJohnson",
      profileImageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
      text: "Great insights, thanks for sharing!",
      createdAt: "2024-10-14T15:40:00Z",
      likesCount: 3,
      isLikedByCurrentUser: true,
    },
    {
      id: "comment_004",
      userId: "user_004",
      username: "EmilyClark",
      profileImageUrl: "https://randomuser.me/api/portraits/women/4.jpg",
      text: "Couldn’t have said it better!",
      createdAt: "2024-10-14T16:00:00Z",
      likesCount: 8,
      isLikedByCurrentUser: false,
    },
    {
      id: "comment_005",
      userId: "user_005",
      username: "MikeBrown",
      profileImageUrl: "https://randomuser.me/api/portraits/men/5.jpg",
      text: "What a fantastic post. Keep it up!",
      createdAt: "2024-10-13T08:30:10Z",
      likesCount: 20,
      isLikedByCurrentUser: true,
    },
  ],
  total: 10,
  start: 1,
  end: 5,
  next: "https://social.bevetu.com/v1/comments?page=2",
  prev: null,
};

export const unsaveReturn = {
  message: "OK",
};

export const deleteCommentReturn = {
  message: "OK",
};

export const unlikeReturn = {
  message: "OK",
};

export const publishPostReturn = {
  message: "publish",
};

export const unpublishPostReturn = {
  message: "unpublish",
};

export const deletePostReturn = {
  message: "deleted",
};

export const createDraftPostReturn = {
  message: "created",
};

export const updatePostReturn = {
  message:'updated'
}

export const viewPostReturn: IViewPostReturn = {
  id: "1",
  userId: "101",
  username: "john_doe",
  profileImageUrl: "https://example.com/images/profiles/john.jpg",
  imageUrls: [
    "https://example.com/images/posts/image1.jpg",
    "https://example.com/images/posts/image2.jpg",
  ],
  caption: "Beautiful day at the park!",
  content: "Had a great time enjoying nature with friends.",
  hashtags: ["#park", "#nature", "#friends"],
  location: {
    name: "Central Park",
    coordinates: {
      latitude: 40.785091,
      longitude: -73.968285,
    },
  },
  createdAt: "2024-10-16T10:30:00Z",
  likesCount: 50,
  commentsCount: 10,
  isLikedByCurrentUser: false,
  // comments: [
  //   {
  //     commentId: "c1",
  //     userId: "102",
  //     username: "jane_smith",
  //     profileImageUrl: "https://example.com/images/profiles/jane.jpg",
  //     text: "Looks amazing!",
  //     createdAt: "2024-10-16T11:00:00Z",
  //     likesCount: 5,
  //     isLikedByCurrentUser: false,
  //   },
  // ],
  isSavedByCurrentUser: false,
  isArchived: false,
  isSponsored: false,
};

export const viewPostsReturn: IViewPostsReturn = {
  posts: [
    {
      id: "1",
      userId: "101",
      username: "john_doe",
      profileImageUrl: "https://example.com/images/profiles/john.jpg",
      imageUrls: [
        "https://example.com/images/posts/image1.jpg",
        "https://example.com/images/posts/image2.jpg",
      ],
      caption: "Beautiful day at the park!",
      content: "Had a great time enjoying nature with friends.",
      hashtags: ["#park", "#nature", "#friends"],
      location: {
        name: "Central Park",
        coordinates: {
          latitude: 40.785091,
          longitude: -73.968285,
        },
      },
      createdAt: "2024-10-16T10:30:00Z",
      likesCount: 50,
      commentsCount: 10,
      isLikedByCurrentUser: false,
      // comments: [
      //   {
      //     commentId: "c1",
      //     userId: "102",
      //     username: "jane_smith",
      //     profileImageUrl: "https://example.com/images/profiles/jane.jpg",
      //     text: "Looks amazing!",
      //     createdAt: "2024-10-16T11:00:00Z",
      //     likesCount: 5,
      //     isLikedByCurrentUser: false,
      //   },
      // ],
      isSavedByCurrentUser: false,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "2",
      userId: "103",
      username: "alice_wonder",
      profileImageUrl: "https://example.com/images/profiles/alice.jpg",
      imageUrls: ["https://example.com/images/posts/image3.jpg"],
      caption: "Loving my new plant!",
      content: "Can't wait for it to grow.",
      hashtags: ["#plant", "#home"],
      location: {
        name: "My Home",
        coordinates: {
          latitude: 34.052235,
          longitude: -118.243683,
        },
      },
      createdAt: "2024-10-16T12:00:00Z",
      likesCount: 25,
      commentsCount: 3,
      isLikedByCurrentUser: true,
      // comments: [],
      isSavedByCurrentUser: true,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "3",
      userId: "104",
      username: "bob_baker",
      profileImageUrl: "https://example.com/images/profiles/bob.jpg",
      imageUrls: [],
      caption: "Just finished a marathon!",
      content: "Feeling accomplished!",
      hashtags: ["#marathon", "#running"],
      createdAt: "2024-10-16T13:00:00Z",
      likesCount: 100,
      commentsCount: 15,
      isLikedByCurrentUser: false,
      // comments: [
      //   {
      //     commentId: "c2",
      //     userId: "105",
      //     username: "charlie_chaplin",
      //     profileImageUrl: "https://example.com/images/profiles/charlie.jpg",
      //     text: "Congrats!",
      //     createdAt: "2024-10-16T14:00:00Z",
      //     likesCount: 2,
      //     isLikedByCurrentUser: false,
      //   },
      // ],
      isSavedByCurrentUser: false,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "4",
      userId: "106",
      username: "daisy_dream",
      profileImageUrl: "https://example.com/images/profiles/daisy.jpg",
      imageUrls: ["https://example.com/images/posts/image4.jpg"],
      caption: "Traveling to Paris!",
      content: "So excited to see the Eiffel Tower.",
      hashtags: ["#travel", "#paris"],
      location: {
        name: "Paris, France",
        coordinates: {
          latitude: 48.856613,
          longitude: 2.352222,
        },
      },
      createdAt: "2024-10-16T15:00:00Z",
      likesCount: 200,
      commentsCount: 30,
      isLikedByCurrentUser: true,
      // comments: [],
      isSavedByCurrentUser: true,
      isArchived: false,
      isSponsored: true,
    },
    {
      id: "5",
      userId: "107",
      username: "eve_eats",
      profileImageUrl: "https://example.com/images/profiles/eve.jpg",
      imageUrls: ["https://example.com/images/posts/image5.jpg"],
      caption: "Delicious brunch!",
      content: "Eggs benedict with avocado.",
      hashtags: ["#brunch", "#foodie"],
      createdAt: "2024-10-16T16:00:00Z",
      likesCount: 75,
      commentsCount: 20,
      isLikedByCurrentUser: false,
      // comments: [],
      isSavedByCurrentUser: false,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "6",
      userId: "108",
      username: "frank_fitness",
      profileImageUrl: "https://example.com/images/profiles/frank.jpg",
      imageUrls: ["https://example.com/images/posts/image6.jpg"],
      caption: "Morning workout session!",
      content: "Feeling great after a long run.",
      hashtags: ["#fitness", "#workout"],
      createdAt: "2024-10-16T17:00:00Z",
      likesCount: 40,
      commentsCount: 5,
      isLikedByCurrentUser: false,
      // comments: [
      //   {
      //     commentId: "c3",
      //     userId: "109",
      //     username: "grace_gains",
      //     profileImageUrl: "https://example.com/images/profiles/grace.jpg",
      //     text: "Keep it up!",
      //     createdAt: "2024-10-16T18:00:00Z",
      //     likesCount: 1,
      //     isLikedByCurrentUser: false,
      //   },
      // ],
      isSavedByCurrentUser: true,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "7",
      userId: "110",
      username: "hannah_hikes",
      profileImageUrl: "https://example.com/images/profiles/hannah.jpg",
      imageUrls: ["https://example.com/images/posts/image7.jpg"],
      caption: "Hiking the beautiful mountains.",
      content: "Nothing beats nature!",
      hashtags: ["#hiking", "#nature"],
      createdAt: "2024-10-16T19:00:00Z",
      likesCount: 90,
      commentsCount: 12,
      isLikedByCurrentUser: true,
      // comments: [],
      isSavedByCurrentUser: false,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "8",
      userId: "111",
      username: "ivan_illustrates",
      profileImageUrl: "https://example.com/images/profiles/ivan.jpg",
      imageUrls: ["https://example.com/images/posts/image8.jpg"],
      caption: "Just finished my latest painting!",
      content: "Art is a wonderful escape.",
      hashtags: ["#art", "#painting"],
      createdAt: "2024-10-16T20:00:00Z",
      likesCount: 120,
      commentsCount: 18,
      isLikedByCurrentUser: false,
      // comments: [],
      isSavedByCurrentUser: true,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "9",
      userId: "112",
      username: "jack_jokes",
      profileImageUrl: "https://example.com/images/profiles/jack.jpg",
      imageUrls: [],
      caption: "Here's a funny joke for you!",
      content:
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
      hashtags: ["#jokes", "#funny"],
      createdAt: "2024-10-16T21:00:00Z",
      likesCount: 60,
      commentsCount: 8,
      isLikedByCurrentUser: true,
      // comments: [],
      isSavedByCurrentUser: false,
      isArchived: false,
      isSponsored: false,
    },
    {
      id: "10",
      userId: "113",
      username: "karen_kids",
      profileImageUrl: "https://example.com/images/profiles/karen.jpg",
      imageUrls: ["https://example.com/images/posts/image9.jpg"],
      caption: "Family time at the zoo!",
      content: "Had a great day with the kids.",
      hashtags: ["#family", "#zoo"],
      createdAt: "2024-10-16T22:00:00Z",
      likesCount: 110,
      commentsCount: 25,
      isLikedByCurrentUser: false,
      // comments: [],
      isSavedByCurrentUser: true,
      isArchived: false,
      isSponsored: false,
    },
  ],
  total: 10,
  start: 0,
  end: 9,
  next: null,
  prev: null,
};


export const createPostReturn = {
  message: "created",
};


export const savePostReturn = {
  message: "saved",
};

export const commentPostReturn = {
  message: "created",
};

export const likePostReturn = {
  message: "created",
};