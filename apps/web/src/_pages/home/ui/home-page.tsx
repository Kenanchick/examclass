import styles from "./home-page.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.eyebrow}>ExamClass</p>
        <h1>Основа проекта готова</h1>
        <p>
          Фронтенд и API запускаются независимо и готовы к дальнейшей
          разработке.
        </p>
      </section>
    </main>
  );
}
