/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log("Disabling foreign key checks");
  await knex.raw("SET foreign_key_checks = 0;");

  console.log("Truncating all tables");
  // Hapus data dalam urutan yang benar (child tables dulu)
  await knex("episodes").truncate();
  await knex("movies").truncate();
  await knex("series").truncate();
  await knex("content_base").truncate();

  console.log("Inserting dummy content data");

  // 1. Insert content_base data
  const contentBaseData = [
    // Series
    {
      title: "Stranger Things",
      description:
        "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.",
      release_date: "2016-07-15",
      film_rating: "TV-14",
      content_type: "series",
      thumbnail_url: "https://example.com/thumb1.jpg",
      banner_url: "https://example.com/banner1.jpg",
      trailer_url: "https://example.com/trailer1.mp4",
      age_rating: "14+",
    },
    {
      title: "The Crown",
      description:
        "Follows the political rivalries and romance of Queen Elizabeth II's reign.",
      release_date: "2016-11-04",
      film_rating: "TV-MA",
      content_type: "series",
      thumbnail_url: "https://example.com/thumb2.jpg",
      banner_url: "https://example.com/banner2.jpg",
      trailer_url: "https://example.com/trailer2.mp4",
      age_rating: "16+",
    },
    // Movies
    {
      title: "Avengers: Endgame",
      description: "The Avengers take one final stand against Thanos.",
      release_date: "2019-04-26",
      film_rating: "PG-13",
      content_type: "movie",
      thumbnail_url: "https://example.com/thumb3.jpg",
      banner_url: "https://example.com/banner3.jpg",
      trailer_url: "https://example.com/trailer3.mp4",
      age_rating: "13+",
    },
    {
      title: "Inception",
      description:
        "A thief who steals corporate secrets through dream-sharing technology.",
      release_date: "2010-07-16",
      film_rating: "PG-13",
      content_type: "movie",
      thumbnail_url: "https://example.com/thumb4.jpg",
      banner_url: "https://example.com/banner4.jpg",
      trailer_url: "https://example.com/trailer4.mp4",
      age_rating: "13+",
    },
    {
      title: "The Dark Knight",
      description:
        "Batman faces the Joker, a criminal mastermind seeking to create chaos.",
      release_date: "2008-07-18",
      film_rating: "PG-13",
      content_type: "movie",
      thumbnail_url: "https://example.com/thumb5.jpg",
      banner_url: "https://example.com/banner5.jpg",
      trailer_url: "https://example.com/trailer5.mp4",
      age_rating: "13+",
    },
  ];

  const contentBaseIds = await knex("content_base").insert(contentBaseData);

  // 2. Insert series data
  const seriesData = [
    {
      content_base_id: contentBaseIds[0], // Stranger Things
      episode_duration: 50,
      total_seasons: 4,
      total_episodes: 34,
      status: "completed",
      next_episode_date: null,
    },
    {
      content_base_id: contentBaseIds[1], // The Crown
      episode_duration: 55,
      total_seasons: 6,
      total_episodes: 60,
      status: "completed",
      next_episode_date: null,
    },
  ];

  const seriesIds = await knex("series").insert(seriesData);

  // 3. Insert movies data
  const moviesData = [
    {
      content_base_id: contentBaseIds[2], // Avengers: Endgame
      duration: 181,
    },
    {
      content_base_id: contentBaseIds[3], // Inception
      duration: 148,
    },
    {
      content_base_id: contentBaseIds[4], // The Dark Knight
      duration: 152,
    },
  ];

  await knex("movies").insert(moviesData);

  // 4. Insert episodes data untuk series
  const episodesData = [
    // Stranger Things Season 1
    {
      series_id: seriesIds[0],
      season_number: 1,
      episode_number: 1,
      episode_title: "Chapter One: The Vanishing of Will Byers",
      episode_description:
        "A young boy disappears under strange circumstances.",
      duration: 47,
      release_date: "2016-07-15",
      thumbnail_url: "https://example.com/ep1.jpg",
    },
    {
      series_id: seriesIds[0],
      season_number: 1,
      episode_number: 2,
      episode_title: "Chapter Two: The Weirdo on Maple Street",
      episode_description: "A girl with mysterious powers appears.",
      duration: 55,
      release_date: "2016-07-15",
      thumbnail_url: "https://example.com/ep2.jpg",
    },
    {
      series_id: seriesIds[0],
      season_number: 1,
      episode_number: 3,
      episode_title: "Chapter Three: Holly, Jolly",
      episode_description: "The search for the missing boy continues.",
      duration: 51,
      release_date: "2016-07-15",
      thumbnail_url: "https://example.com/ep3.jpg",
    },
    // The Crown Season 1
    {
      series_id: seriesIds[1],
      season_number: 1,
      episode_number: 1,
      episode_title: "Wolferton Splash",
      episode_description: "King George VI's health begins to fail.",
      duration: 58,
      release_date: "2016-11-04",
      thumbnail_url: "https://example.com/crown1.jpg",
    },
    {
      series_id: seriesIds[1],
      season_number: 1,
      episode_number: 2,
      episode_title: "Hyde Park Corner",
      episode_description: "Elizabeth becomes Queen after her father's death.",
      duration: 56,
      release_date: "2016-11-04",
      thumbnail_url: "https://example.com/crown2.jpg",
    },
  ];

  await knex("episodes").insert(episodesData);

  console.log("Enabling foreign key checks");
  await knex.raw("SET foreign_key_checks = 1;");

  console.log("Seed data completed successfully!");
  console.log(
    `Created: ${contentBaseIds.length} content bases, ${seriesIds.length} series, ${moviesData.length} movies, ${episodesData.length} episodes`
  );
};
