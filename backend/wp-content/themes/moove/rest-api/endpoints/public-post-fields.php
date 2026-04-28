<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Adds helper fields to wp/v2 post responses.
 * This keeps native IDs while also exposing resolved URLs.
 */

function moove_get_post_file_url($post_id) {
    $acf = get_fields($post_id);

    if (!$acf || !is_array($acf) || !isset($acf['file']) || empty($acf['file'])) {
        return null;
    }

    $file = $acf['file'];

    if (is_array($file) && !empty($file['url'])) {
        return $file['url'];
    }

    if (is_numeric($file)) {
        $url = wp_get_attachment_url((int) $file);
        return $url ? $url : null;
    }

    return null;
}

function moove_is_post_ebook($post_id) {
    $acf = get_fields($post_id);

    if (!$acf || !is_array($acf)) {
        return false;
    }

    $content_type = $acf['content_type'] ?? null;
    $has_file = !empty($acf['file']);

    $is_explicit_false = (
        $content_type === false ||
        $content_type === 0 ||
        $content_type === '0' ||
        $content_type === 'false'
    );

    return $is_explicit_false && $has_file;
}

function moove_register_post_rest_fields() {
    register_rest_field('post', 'featured_media_url', array(
        'get_callback' => function($post_arr) {
            $featured_media_id = isset($post_arr['featured_media']) ? (int) $post_arr['featured_media'] : 0;

            if ($featured_media_id <= 0) {
                return null;
            }

            $url = wp_get_attachment_url($featured_media_id);
            return $url ? $url : null;
        },
        'schema' => array(
            'description' => 'Resolved featured image URL',
            'type' => array('string', 'null'),
            'context' => array('view', 'edit'),
        ),
    ));

    register_rest_field('post', 'file_url', array(
        'get_callback' => function($post_arr) {
            return moove_get_post_file_url((int) $post_arr['id']);
        },
        'schema' => array(
            'description' => 'Resolved download file URL from ACF file field',
            'type' => array('string', 'null'),
            'context' => array('view', 'edit'),
        ),
    ));

    register_rest_field('post', 'is_ebook', array(
        'get_callback' => function($post_arr) {
            return moove_is_post_ebook((int) $post_arr['id']);
        },
        'schema' => array(
            'description' => 'Whether this post is an ebook according to business rule',
            'type' => 'boolean',
            'context' => array('view', 'edit'),
        ),
    ));
}

add_action('rest_api_init', 'moove_register_post_rest_fields');
