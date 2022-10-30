import { CreateBookmarkDto } from 'src/bookmark/dto';

export const bookmarkStub = (): CreateBookmarkDto => {
  return {
    title: 'NestJS Tutorial',
    description: 'NestJS REST API tutorial video',
    link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=12165s',
  };
};
