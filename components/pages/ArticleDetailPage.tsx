import Image from "next/image";
import Link from "next/link";
import type { ArticleDetail } from "@/apis/articles";
import { formatShortDate } from "@/lib/time-manipulation";
import type { VerificationStatusEnum } from "@/lib/types";
import ArticleDetailActions from "../articles/ArticleDetailActions";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface ArticleViewer {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface ArticleDetailPageProps {
  article: ArticleDetail;
  body: string | null;
  readingMinutes: number;
  viewer: ArticleViewer;
}

// Keywords arrive as one comma-separated string, not an array.
function parseKeywords(keywords?: string): string[] {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

// Arbitrary descendant variants stand in for a typography plugin this project doesn't install.
const PROSE_CLASS = [
  "text-[17px] leading-[1.75] text-[#242832] lg:text-[19px] lg:leading-[1.8]",
  "[&_p]:mt-6 [&_p:first-child]:mt-0",
  "[&_h2]:mt-10 [&_h2]:font-stack-sans-headline [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:leading-snug [&_h2]:text-[#172033]",
  "[&_h3]:mt-8 [&_h3]:font-stack-sans-headline [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-[#172033]",
  "[&_h4]:mt-6 [&_h4]:font-stack-sans-headline [&_h4]:text-lg [&_h4]:font-medium [&_h4]:text-[#172033]",
  "[&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2",
  "[&_blockquote]:mt-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5f6573]",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:font-semibold [&_strong]:text-[#172033]",
  "[&_code]:rounded [&_code]:bg-[#f5f7fb] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
  "[&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#202428] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
  "[&_hr]:my-10 [&_hr]:border-[#e6e9ef]",
  "[&_img]:mt-6 [&_img]:w-full [&_img]:rounded-xl",
  "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-[#7b8190]",
].join(" ");

function AuthorIdentity({
  authorName,
  authorAvatar,
  profileHref,
  meta,
}: {
  authorName: string;
  authorAvatar?: string;
  profileHref: string | null;
  meta: string;
}) {
  const body = (
    <>
      <Avatar src={authorAvatar} name={authorName} size={44} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-[#172033]">
          {authorName}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-[#7b8190]">{meta}</p>
      </div>
    </>
  );

  if (!profileHref) {
    return <div className="flex min-w-0 items-center gap-3">{body}</div>;
  }

  return (
    <Link href={profileHref} className="flex min-w-0 items-center gap-3">
      {body}
    </Link>
  );
}

export default function ArticleDetailPage({
  article,
  body,
  readingMinutes,
  viewer,
}: ArticleDetailPageProps) {
  const keywords = parseKeywords(article.keywords);
  const isOwnArticle =
    Boolean(viewer.userId) && article.author_id === viewer.userId;
  const canEdit = isOwnArticle;
  // articles/* answers with author_id but no author_username, so only the viewer's own resolves.
  const authorProfileHref =
    isOwnArticle && viewer.username ? `/profile/${viewer.username}` : null;

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Artikel"
      />

      <article className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-6 lg:px-0 lg:pt-12">
        {article.category_name && (
          <Label variant="gray" className="mb-4">
            {article.category_name}
          </Label>
        )}

        <h1 className="font-stack-sans-headline text-[28px] font-medium leading-tight text-[#172033] sm:text-4xl sm:leading-[1.2]">
          {article.title}
        </h1>

        {article.description && (
          <p className="mt-4 text-lg leading-relaxed text-[#5f6573] sm:text-xl">
            {article.description}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between gap-3 border-y border-[#e6e9ef] py-4">
          <AuthorIdentity
            authorName={article.author_name}
            authorAvatar={article.author_avatar}
            profileHref={authorProfileHref}
            meta={`${formatShortDate(article.published_at)} · ${readingMinutes} menit baca`}
          />

          <ArticleDetailActions
            article={article}
            canEdit={canEdit}
            isSignedIn={Boolean(viewer.userId)}
          />
        </div>

        {article.image_url && (
          <figure className="mt-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#f5f7fb]">
              <Image
                src={article.image_url}
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </figure>
        )}

        {body ? (
          <div
            className={`mt-8 ${PROSE_CLASS}`}
            // Sanitized server-side by lib/article-body.ts — never pass raw body HTML here.
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="mt-8 text-[15px] text-[#7b8190]">
            Artikel ini belum memiliki isi.
          </p>
        )}

        {keywords.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-[#e6e9ef] pt-6">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-[#f5f7fb] px-3 py-1.5 text-[13px] text-[#5f6573]"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[#e6e9ef] p-5">
          <Avatar
            src={article.author_avatar}
            name={article.author_name}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-[#7b8190]">Ditulis oleh</p>
            <p className="mt-0.5 truncate text-[15px] font-semibold text-[#172033]">
              {article.author_name}
            </p>
          </div>
        </div>
      </article>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
