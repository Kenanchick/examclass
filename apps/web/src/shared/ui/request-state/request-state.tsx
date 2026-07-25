import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
  SearchX,
  WifiOff,
} from "lucide-react";

type RequestStateVariant = "loading" | "error" | "not-found" | "empty";

type RequestStateProps = {
  variant: RequestStateVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  backHref?: string;
  backLabel?: string;
};

const stateContent = {
  loading: {
    title: "Собираем материалы…",
    description:
      "Проверяем данные и готовим страницу. Это займёт всего пару секунд.",
    Icon: LoaderCircle,
  },
  error: {
    title: "Не удалось загрузить данные",
    description:
      "Проверьте подключение к интернету и попробуйте обновить страницу ещё раз.",
    Icon: WifiOff,
  },
  "not-found": {
    title: "Ничего не нашлось",
    description:
      "Проверьте запрос или вернитесь к банку задач и выберите нужную тему.",
    Icon: SearchX,
  },
  empty: {
    title: "Здесь пока ничего нет",
    description:
      "Как только появятся новые материалы, они будут показаны на этой странице.",
    Icon: SearchX,
  },
} as const;

export function RequestState({
  variant,
  title,
  description,
  onRetry,
  retryLabel = "Попробовать снова",
  backHref,
  backLabel = "Вернуться назад",
}: RequestStateProps) {
  const content = stateContent[variant];
  const Icon = content.Icon;
  const isLoading = variant === "loading";
  const isPlainState = variant === "empty" || variant === "not-found";

  return (
    <section
      aria-busy={isLoading}
      className={
        isPlainState
          ? "overflow-hidden p-4 sm:p-8"
          : "overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#f4f9ff] p-6 sm:p-8"
      }
    >
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
        <Image
          alt="Лисёнок ищет нужные материалы"
          className="h-auto w-44 shrink-0 sm:w-52"
          height={1536}
          priority={variant !== "loading"}
          src="/fox-search.png"
          width={1024}
        />

        <div className="max-w-2xl text-center sm:text-left">
          <span
            className={`inline-flex size-11 items-center justify-center text-brand ${
              isPlainState
                ? "bg-transparent"
                : "rounded-2xl bg-white shadow-[0_4px_0_#c1d9f1]"
            }`}
          >
            <Icon
              className={`size-5 ${isLoading ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            {title ?? content.title}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted sm:text-base">
            {description ?? content.description}
          </p>

          {!isLoading && (onRetry || backHref) && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              {onRetry && (
                <button
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand bg-white px-4 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
                  onClick={onRetry}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  {retryLabel}
                </button>
              )}
              {backHref && (
                <Link
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-brand transition hover:bg-white"
                  href={backHref}
                >
                  <ArrowLeft className="size-4" />
                  {backLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
