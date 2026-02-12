/**
 * Migration: Create beta_feedback and beta_feedback_tags tables
 * Date: 2026-02-10
 * Purpose: Beta feedback and incident tracking for wizard testers.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE beta_feedback (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        reporter_name varchar(100) NOT NULL,
        reporter_email varchar(255),
        category varchar(50) NOT NULL,
        severity varchar(20) NOT NULL DEFAULT 'medium',
        title varchar(255) NOT NULL,
        description text NOT NULL,
        page_url varchar(500),
        browser_info varchar(500),
        screen_size varchar(50),
        steps_to_reproduce text,
        expected_behavior text,
        actual_behavior text,
        status varchar(30) NOT NULL DEFAULT 'new',
        resolution_notes text,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE TABLE beta_feedback_tags (
        id serial PRIMARY KEY,
        feedback_id uuid NOT NULL REFERENCES beta_feedback(id) ON DELETE CASCADE,
        tag varchar(100) NOT NULL
      );
    `);
    console.log('[beta_feedback] Created beta_feedback and beta_feedback_tags tables');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS beta_feedback_tags;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS beta_feedback;`);
    console.log('[beta_feedback] Dropped beta_feedback_tags and beta_feedback tables');
  },
};
