import { TODO } from "../types/basic.type";
import { ICreatePostPayload, ISavePostPayload, ICreateCommentPayload, ILikePostPayload, IViewPostsPayload, ICreateDraftPostPayload, IUpdatePostPayload, IViewPostPayload, IPublishPostPayload, IUnpublishPostPayload, IUnlikePayload, IDeleteCommentPayload, IUnsavePayload, IViewCommentsPayload } from "../types/social-services.types";
import { IBaseService } from "./base-service.interface";

export interface ISocialServices extends IBaseService {
  createPost(payload: ICreatePostPayload): Promise<TODO>;
  savePost(payload: ISavePostPayload): Promise<TODO>;
  createComment(payload: ICreateCommentPayload): Promise<TODO>;
  likePost(payload: ILikePostPayload): Promise<TODO>;
  viewPosts(payload: IViewPostsPayload): Promise<TODO>;
  createDraftPost(payload: ICreateDraftPostPayload): Promise<TODO>;
  updatePost(payload: IUpdatePostPayload): Promise<TODO>;
  viewPost(payload: IViewPostPayload): Promise<TODO>;
  deletePost(payload: IViewPostPayload): Promise<TODO>;
  publishPost(payload: IPublishPostPayload): Promise<TODO>;
  unpublishPost(payload: IUnpublishPostPayload): Promise<TODO>;
  unlike(payload: IUnlikePayload): Promise<TODO>;
  deleteComment(payload: IDeleteCommentPayload): Promise<TODO>;
  unsave(payload: IUnsavePayload): Promise<TODO>;
  viewComments(payload: IViewCommentsPayload): Promise<TODO>;
}
