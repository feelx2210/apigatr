import { ParsedAPI, PlatformTransformation, PlatformFeature, UIComponent, CodeFile } from '../types';
import { WordPressIntelligence } from '../wordpress-intelligence';

export class WordPressTransformer {
  transform(api: ParsedAPI, options?: { customizedSpec?: any; userChoices?: any; intelligence?: WordPressIntelligence }): PlatformTransformation {
    // Use intelligent analysis if available
    const intelligence = options?.intelligence;
    const userChoices = options?.userChoices;
    
    const features = intelligence?.wordpressFeatures 
      ? this.mapIntelligentFeatures(intelligence.wordpressFeatures, userChoices?.selectedFeatures || [])
      : this.mapApiToWordPressFeatures(api);
    
    const codeFiles = this.generateWordPressCode(api, features, intelligence);
    
    return {
      platform: 'wordpress',
      features,
      codeFiles,
      configuration: this.generateWordPressConfig(api, intelligence),
      documentation: this.generateDocumentation(api, features, intelligence)
    };
  }

  private mapIntelligentFeatures(wordpressFeatures: any[], selectedFeatureIds: string[]): PlatformFeature[] {
    return wordpressFeatures
      .filter(feature => selectedFeatureIds.includes(feature.id))
      .map(feature => ({
        name: feature.name,
        description: feature.description,
        apiEndpoints: feature.endpoints?.map((e: any) => e.id) || [],
        implementation: this.mapWordPressIntegrationType(feature.wordpressIntegration?.type),
        userInterface: this.generateIntelligentUI(feature)
      }));
  }

  private mapWordPressIntegrationType(wpType: string): 'admin-ui' | 'webhook' | 'api-integration' | 'theme-extension' | 'block' {
    switch (wpType) {
      case 'gutenberg-block': return 'block';
      case 'theme-integration': return 'theme-extension';
      case 'rest-endpoint': return 'api-integration';
      case 'cron-job': return 'webhook';
      default: return 'admin-ui';
    }
  }

  private generateIntelligentUI(feature: any): UIComponent[] {
    // Generate UI based on WordPress integration type
    switch (feature.wordpressIntegration?.type) {
      case 'gutenberg-block':
        return [{
          type: 'form' as const,
          name: `${feature.id}-block`,
          fields: [
            { name: 'content', type: 'textarea' as const, label: 'Content to Process', required: true }
          ],
          actions: [
            { name: 'process', type: 'submit' as const, endpoint: feature.endpoints?.[0]?.id }
          ]
        }];
      case 'media-library':
        return [{
          type: 'form' as const,
          name: `${feature.id}-media`,
          fields: [
            { name: 'auto-process', type: 'checkbox' as const, label: 'Auto-process uploads', required: false },
            { name: 'quality', type: 'select' as const, label: 'Processing Quality', required: false, options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' }
            ]}
          ],
          actions: [
            { name: 'save-settings', type: 'submit' as const }
          ]
        }];
      default:
        return [{
          type: 'form' as const,
          name: `${feature.id}-form`,
          fields: [
            { name: 'input', type: 'text' as const, label: 'Input', required: true }
          ],
          actions: [
            { name: 'submit', type: 'submit' as const }
          ]
        }];
    }
  }

  private mapApiToWordPressFeatures(api: ParsedAPI): PlatformFeature[] {
    const features: PlatformFeature[] = [];
    
    // Group endpoints by category
    const endpointsByCategory = api.endpoints.reduce((acc, endpoint) => {
      const category = endpoint.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(endpoint);
      return acc;
    }, {} as Record<string, typeof api.endpoints>);

    // Map categories to WordPress features
    Object.entries(endpointsByCategory).forEach(([category, endpoints]) => {
      const feature = this.createWordPressFeature(category, endpoints, api);
      if (feature) features.push(feature);
    });

    // Add settings feature for API configuration
    features.unshift({
      name: 'API Settings',
      description: `Configure ${api.name} API credentials and settings`,
      apiEndpoints: [],
      implementation: 'admin-ui',
      userInterface: this.createSettingsUI(api)
    });

    return features;
  }

  private createWordPressFeature(category: string, endpoints: any[], api: ParsedAPI): PlatformFeature | null {
    const categoryMappings: Record<string, { name: string; description: string; implementation: any; ui: string }> = {
      'translation': {
        name: 'Content Translation',
        description: 'Translate posts, pages, and custom content using AI',
        implementation: 'admin-ui',
        ui: 'translation-manager'
      },
      'language-support': {
        name: 'Language Management',
        description: 'Manage supported languages and translation preferences',
        implementation: 'admin-ui',
        ui: 'language-settings'
      },
      'document-processing': {
        name: 'Bulk Translation',
        description: 'Translate multiple posts, pages, or content in bulk',
        implementation: 'admin-ui',
        ui: 'bulk-translator'
      },
      'authentication': {
        name: 'API Authentication',
        description: 'Manage API authentication and connection status',
        implementation: 'admin-ui',
        ui: 'auth-settings'
      }
    };

    const mapping = categoryMappings[category];
    if (!mapping) return null;

    return {
      name: mapping.name,
      description: mapping.description,
      apiEndpoints: endpoints.map(e => e.id),
      implementation: mapping.implementation,
      userInterface: this.createFeatureUI(mapping.ui, endpoints, api)
    };
  }

  private createSettingsUI(api: ParsedAPI): UIComponent[] {
    const authFields = api.authentication.map(auth => ({
      name: auth.name || 'apiKey',
      type: 'text' as const,
      label: `${auth.name || 'API Key'}`,
      required: true
    }));

    return [{
      type: 'form' as const,
      name: 'api-settings',
      fields: [
        ...authFields,
        {
          name: 'enabled',
          type: 'checkbox' as const,
          label: 'Enable API Integration',
          required: false
        },
        {
          name: 'auto_translate',
          type: 'checkbox' as const,
          label: 'Auto-translate new content',
          required: false
        }
      ],
      actions: [
        { name: 'save', type: 'submit' as const },
        { name: 'test', type: 'submit' as const, endpoint: 'test-connection' }
      ]
    }];
  }

  private createFeatureUI(uiType: string, endpoints: any[], api: ParsedAPI): UIComponent[] {
    switch (uiType) {
      case 'translation-manager':
        return [{
          type: 'form' as const,
          name: 'content-translation',
          fields: [
            { name: 'contentType', type: 'select' as const, label: 'Content Type', required: true, options: [
              { label: 'Posts', value: 'post' },
              { label: 'Pages', value: 'page' },
              { label: 'Custom Post Types', value: 'custom' }
            ]},
            { name: 'sourceLanguage', type: 'select' as const, label: 'Source Language', required: true, options: this.getLanguageOptions() },
            { name: 'targetLanguages', type: 'select' as const, label: 'Target Languages', required: true, options: this.getLanguageOptions() },
            { name: 'includeExcerpts', type: 'checkbox' as const, label: 'Include Excerpts', required: false },
            { name: 'includeMetaFields', type: 'checkbox' as const, label: 'Include Custom Fields', required: false }
          ],
          actions: [
            { name: 'translate', type: 'submit' as const, endpoint: 'translate-content' }
          ]
        }];
      
      case 'bulk-translator':
        return [{
          type: 'form' as const,
          name: 'bulk-translation',
          fields: [
            { name: 'contentSelection', type: 'select' as const, label: 'Content to Translate', required: true, options: [
              { label: 'All Posts', value: 'all_posts' },
              { label: 'Selected Category', value: 'category' },
              { label: 'Tagged Content', value: 'tagged' },
              { label: 'Date Range', value: 'date_range' }
            ]},
            { name: 'targetLanguages', type: 'select' as const, label: 'Target Languages', required: true, options: this.getLanguageOptions() },
            { name: 'batchSize', type: 'number' as const, label: 'Batch Size', required: false }
          ],
          actions: [
            { name: 'startBulkTranslation', type: 'submit' as const, endpoint: 'bulk-translate' }
          ]
        }];
      
      default:
        return [];
    }
  }

  private getLanguageOptions() {
    return [
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' },
      { label: 'German', value: 'de' },
      { label: 'Italian', value: 'it' },
      { label: 'Portuguese', value: 'pt' },
      { label: 'Dutch', value: 'nl' },
      { label: 'Japanese', value: 'ja' },
      { label: 'Chinese (Simplified)', value: 'zh-CN' },
      { label: 'Chinese (Traditional)', value: 'zh-TW' }
    ];
  }

  private generateWordPressCode(api: ParsedAPI, features: PlatformFeature[], intelligence?: WordPressIntelligence): CodeFile[] {
    const files: CodeFile[] = [];

    // Main plugin file
    files.push({
      path: `${api.name.toLowerCase().replace(/\s+/g, '-')}-integration.php`,
      content: this.generateMainPluginFile(api),
      type: 'component',
      language: 'php'
    });

    // API service class
    files.push({
      path: 'includes/class-api-service.php',
      content: this.generateApiService(api),
      type: 'api',
      language: 'php'
    });

    // Admin class
    files.push({
      path: 'includes/class-admin.php',
      content: this.generateAdminClass(api, features),
      type: 'component',
      language: 'php'
    });

    // Shortcodes class
    files.push({
      path: 'includes/class-shortcodes.php',
      content: this.generateShortcodesClass(api),
      type: 'component',
      language: 'php'
    });

    // Widget class
    files.push({
      path: 'includes/class-widget.php',
      content: this.generateWidgetClass(api),
      type: 'component',
      language: 'php'
    });

    // Admin pages for each feature
    features.forEach(feature => {
      if (feature.implementation === 'admin-ui') {
        files.push({
          path: `admin/pages/${feature.name.toLowerCase().replace(/\s+/g, '-')}.php`,
          content: this.generateAdminPage(feature, api),
          type: 'component',
          language: 'php'
        });
      }
    });

    // CSS and JS assets
    files.push({
      path: 'assets/admin.css',
      content: this.generateAdminCSS(),
      type: 'component',
      language: 'javascript'
    });

    files.push({
      path: 'assets/admin.js',
      content: this.generateAdminJS(api),
      type: 'component',
      language: 'javascript'
    });

    // Installation/activation script
    files.push({
      path: 'includes/class-activator.php',
      content: this.generateActivatorClass(api),
      type: 'component',
      language: 'php'
    });

    return files;
  }

  private generateMainPluginFile(api: ParsedAPI): string {
    const pluginName = api.name.replace(/\s+/g, ' ');
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');
    const className = api.name.replace(/\s+/g, '_');

    return `<?php
/**
 * Plugin Name: ${pluginName} Integration
 * Description: ${api.description}
 * Version: 1.0.0
 * Author: WordPress Plugin Generator
 * Text Domain: ${pluginSlug}
 * Domain Path: /languages
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('${className.toUpperCase()}_PLUGIN_URL', plugin_dir_url(__FILE__));
define('${className.toUpperCase()}_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('${className.toUpperCase()}_VERSION', '1.0.0');

// Include required files
require_once ${className.toUpperCase()}_PLUGIN_PATH . 'includes/class-api-service.php';
require_once ${className.toUpperCase()}_PLUGIN_PATH . 'includes/class-admin.php';
require_once ${className.toUpperCase()}_PLUGIN_PATH . 'includes/class-shortcodes.php';
require_once ${className.toUpperCase()}_PLUGIN_PATH . 'includes/class-widget.php';
require_once ${className.toUpperCase()}_PLUGIN_PATH . 'includes/class-activator.php';

/**
 * Main plugin class
 */
class ${className}_Integration {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * API service instance
     */
    public $api_service;
    
    /**
     * Admin instance
     */
    public $admin;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->init_components();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array('${className}_Activator', 'activate'));
        register_deactivation_hook(__FILE__, array('${className}_Activator', 'deactivate'));
    }
    
    /**
     * Initialize components
     */
    private function init_components() {
        $this->api_service = new ${className}_API_Service();
        
        if (is_admin()) {
            $this->admin = new ${className}_Admin();
        }
        
        // Initialize shortcodes
        new ${className}_Shortcodes($this->api_service);
        
        // Initialize widgets
        add_action('widgets_init', function() {
            register_widget('${className}_Widget');
        });
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain
        load_plugin_textdomain('${pluginSlug}', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }
    
    /**
     * Enqueue frontend scripts
     */
    public function enqueue_scripts() {
        wp_enqueue_script('${pluginSlug}-frontend', ${className.toUpperCase()}_PLUGIN_URL . 'assets/frontend.js', array('jquery'), ${className.toUpperCase()}_VERSION, true);
        wp_enqueue_style('${pluginSlug}-frontend', ${className.toUpperCase()}_PLUGIN_URL . 'assets/frontend.css', array(), ${className.toUpperCase()}_VERSION);
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, '${pluginSlug}') !== false) {
            wp_enqueue_script('${pluginSlug}-admin', ${className.toUpperCase()}_PLUGIN_URL . 'assets/admin.js', array('jquery'), ${className.toUpperCase()}_VERSION, true);
            wp_enqueue_style('${pluginSlug}-admin', ${className.toUpperCase()}_PLUGIN_URL . 'assets/admin.css', array(), ${className.toUpperCase()}_VERSION);
            
            // Localize script for AJAX
            wp_localize_script('${pluginSlug}-admin', '${pluginSlug}_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('${pluginSlug}_nonce'),
                'api_endpoints' => ${JSON.stringify(api.endpoints.map(e => ({ id: e.id, name: e.name, method: e.method })))}
            ));
        }
    }
}

// Initialize plugin
function ${pluginSlug.replace(/-/g, '_')}_init() {
    return ${className}_Integration::get_instance();
}

// Start plugin
${pluginSlug.replace(/-/g, '_')}_init();
`;
  }

  private generateApiService(api: ParsedAPI): string {
    const className = api.name.replace(/\s+/g, '_');
    const authMethod = api.authentication[0];
    const baseUrl = this.extractBaseUrl(api);

    return `<?php
/**
 * API Service Class
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ${className}_API_Service {
    
    /**
     * API base URL
     */
    private $base_url = '${baseUrl}';
    
    /**
     * API key
     */
    private $api_key;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->api_key = get_option('${className.toLowerCase()}_api_key');
    }
    
    /**
     * Make API request
     */
    public function make_request($endpoint, $args = array()) {
        $url = $this->base_url . $endpoint;
        
        $default_args = array(
            'headers' => array(
                'Content-Type' => 'application/json',
                ${authMethod?.type === 'apiKey' ? `'Authorization' => 'DeepL-Auth-Key ' . $this->api_key,` : ''}
            ),
            'timeout' => 30
        );
        
        $args = wp_parse_args($args, $default_args);
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return new WP_Error('api_error', $response->get_error_message());
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            return new WP_Error('api_error', 'API request failed with code: ' . $response_code);
        }
        
        return json_decode($response_body, true);
    }
    
    /**
     * Test API connection
     */
    public function test_connection() {
        $response = $this->make_request('/usage', array('method' => 'GET'));
        return !is_wp_error($response);
    }

${api.endpoints.map(endpoint => this.generateWordPressEndpointMethod(endpoint)).join('\n\n')}

    /**
     * Translate text
     */
    public function translate_text($text, $source_lang, $target_lang) {
        $args = array(
            'method' => 'POST',
            'body' => json_encode(array(
                'text' => array($text),
                'source_lang' => strtoupper($source_lang),
                'target_lang' => strtoupper($target_lang)
            ))
        );
        
        $response = $this->make_request('/translate', $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        return isset($response['translations'][0]['text']) ? $response['translations'][0]['text'] : $text;
    }
    
    /**
     * Translate WordPress post
     */
    public function translate_post($post_id, $source_lang, $target_lang) {
        $post = get_post($post_id);
        
        if (!$post) {
            return new WP_Error('post_not_found', 'Post not found');
        }
        
        $translated_title = $this->translate_text($post->post_title, $source_lang, $target_lang);
        $translated_content = $this->translate_text($post->post_content, $source_lang, $target_lang);
        
        if (is_wp_error($translated_title) || is_wp_error($translated_content)) {
            return new WP_Error('translation_failed', 'Translation failed');
        }
        
        // Create translated post
        $translated_post = array(
            'post_title' => $translated_title,
            'post_content' => $translated_content,
            'post_status' => 'draft',
            'post_type' => $post->post_type,
            'post_parent' => $post->ID
        );
        
        $translated_post_id = wp_insert_post($translated_post);
        
        if ($translated_post_id) {
            // Add metadata to link posts
            update_post_meta($translated_post_id, '_translation_source', $post->ID);
            update_post_meta($translated_post_id, '_translation_language', $target_lang);
            
            return $translated_post_id;
        }
        
        return new WP_Error('post_creation_failed', 'Failed to create translated post');
    }
}
`;
  }

  private generateWordPressEndpointMethod(endpoint: any): string {
    const methodName = 'api_' + endpoint.id.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const params = endpoint.parameters.filter((p: any) => p.location === 'query' || p.location === 'path');

    return `    /**
     * ${endpoint.name || endpoint.id}
     * ${endpoint.description || ''}
     */
    public function ${methodName}($args = array()) {
        $endpoint = '${endpoint.path}';
        
        // Replace path parameters
        ${params.filter((p: any) => p.location === 'path').map((p: any) => 
            `if (isset($args['${p.name}'])) {
            $endpoint = str_replace('{${p.name}}', $args['${p.name}'], $endpoint);
        }`
        ).join('\n        ')}
        
        // Add query parameters
        $query_params = array();
        ${params.filter((p: any) => p.location === 'query').map((p: any) => 
            `if (isset($args['${p.name}'])) {
            $query_params['${p.name}'] = $args['${p.name}'];
        }`
        ).join('\n        ')}
        
        if (!empty($query_params)) {
            $endpoint .= '?' . http_build_query($query_params);
        }
        
        $request_args = array(
            'method' => '${endpoint.method}',
        );
        
        if (isset($args['body'])) {
            $request_args['body'] = json_encode($args['body']);
        }
        
        return $this->make_request($endpoint, $request_args);
    }`;
  }

  private generateAdminClass(api: ParsedAPI, features: PlatformFeature[]): string {
    const className = api.name.replace(/\s+/g, '_');
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `<?php
/**
 * Admin Class
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ${className}_Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('wp_ajax_${pluginSlug}_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_${pluginSlug}_translate_content', array($this, 'ajax_translate_content'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            '${api.name} Integration',
            '${api.name}',
            'manage_options',
            '${pluginSlug}',
            array($this, 'admin_page'),
            'dashicons-translation',
            30
        );
        
        ${features.map(feature => `
        add_submenu_page(
            '${pluginSlug}',
            '${feature.name}',
            '${feature.name}',
            'manage_options',
            '${pluginSlug}-${feature.name.toLowerCase().replace(/\s+/g, '-')}',
            array($this, '${feature.name.toLowerCase().replace(/\s+/g, '_')}_page')
        );`).join('')}
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting('${pluginSlug}_settings', '${className.toLowerCase()}_api_key');
        register_setting('${pluginSlug}_settings', '${className.toLowerCase()}_enabled');
        register_setting('${pluginSlug}_settings', '${className.toLowerCase()}_auto_translate');
    }
    
    /**
     * Main admin page
     */
    public function admin_page() {
        include ${className.toUpperCase()}_PLUGIN_PATH . 'admin/pages/main.php';
    }
    
    ${features.map(feature => `
    /**
     * ${feature.name} page
     */
    public function ${feature.name.toLowerCase().replace(/\s+/g, '_')}_page() {
        include ${className.toUpperCase()}_PLUGIN_PATH . 'admin/pages/${feature.name.toLowerCase().replace(/\s+/g, '-')}.php';
    }`).join('')}
    
    /**
     * AJAX: Test API connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('${pluginSlug}_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $api_service = new ${className}_API_Service();
        $result = $api_service->test_connection();
        
        wp_send_json_success(array('connected' => $result));
    }
    
    /**
     * AJAX: Translate content
     */
    public function ajax_translate_content() {
        check_ajax_referer('${pluginSlug}_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_die('Unauthorized');
        }
        
        $post_id = intval($_POST['post_id']);
        $source_lang = sanitize_text_field($_POST['source_lang']);
        $target_lang = sanitize_text_field($_POST['target_lang']);
        
        $api_service = new ${className}_API_Service();
        $result = $api_service->translate_post($post_id, $source_lang, $target_lang);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success(array('translated_post_id' => $result));
        }
    }
}
`;
  }

  private generateShortcodesClass(api: ParsedAPI): string {
    const className = api.name.replace(/\s+/g, '_');
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `<?php
/**
 * Shortcodes Class
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ${className}_Shortcodes {
    
    /**
     * API service instance
     */
    private $api_service;
    
    /**
     * Constructor
     */
    public function __construct($api_service) {
        $this->api_service = $api_service;
        
        add_shortcode('${pluginSlug}_translate', array($this, 'translate_shortcode'));
        add_shortcode('${pluginSlug}_language_switcher', array($this, 'language_switcher_shortcode'));
    }
    
    /**
     * Translation shortcode
     * [${pluginSlug}_translate text="Hello World" source="en" target="es"]
     */
    public function translate_shortcode($atts) {
        $atts = shortcode_atts(array(
            'text' => '',
            'source' => 'en',
            'target' => 'es',
            'cache' => 'true'
        ), $atts);
        
        if (empty($atts['text'])) {
            return '';
        }
        
        // Check cache first
        if ($atts['cache'] === 'true') {
            $cache_key = md5($atts['text'] . $atts['source'] . $atts['target']);
            $cached_translation = get_transient('${pluginSlug}_' . $cache_key);
            
            if ($cached_translation !== false) {
                return $cached_translation;
            }
        }
        
        $translation = $this->api_service->translate_text($atts['text'], $atts['source'], $atts['target']);
        
        if (is_wp_error($translation)) {
            return $atts['text']; // Return original text on error
        }
        
        // Cache the translation for 24 hours
        if ($atts['cache'] === 'true') {
            set_transient('${pluginSlug}_' . $cache_key, $translation, DAY_IN_SECONDS);
        }
        
        return $translation;
    }
    
    /**
     * Language switcher shortcode
     * [${pluginSlug}_language_switcher]
     */
    public function language_switcher_shortcode($atts) {
        $atts = shortcode_atts(array(
            'style' => 'dropdown',
            'show_flags' => 'false'
        ), $atts);
        
        $current_lang = get_locale();
        $languages = array(
            'en_US' => 'English',
            'es_ES' => 'Español',
            'fr_FR' => 'Français',
            'de_DE' => 'Deutsch',
            'it_IT' => 'Italiano'
        );
        
        $output = '<div class="${pluginSlug}-language-switcher">';
        
        if ($atts['style'] === 'dropdown') {
            $output .= '<select onchange="window.location.href=this.value">';
            foreach ($languages as $code => $name) {
                $selected = ($code === $current_lang) ? 'selected' : '';
                $url = add_query_arg('lang', $code, get_permalink());
                $output .= "<option value='{$url}' {$selected}>{$name}</option>";
            }
            $output .= '</select>';
        } else {
            foreach ($languages as $code => $name) {
                $active = ($code === $current_lang) ? 'active' : '';
                $url = add_query_arg('lang', $code, get_permalink());
                $output .= "<a href='{$url}' class='lang-link {$active}'>{$name}</a> ";
            }
        }
        
        $output .= '</div>';
        
        return $output;
    }
}
`;
  }

  private generateWidgetClass(api: ParsedAPI): string {
    const className = api.name.replace(/\s+/g, '_');
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `<?php
/**
 * Widget Class
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ${className}_Widget extends WP_Widget {
    
    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            '${pluginSlug}_widget',
            '${api.name} Translation Widget',
            array('description' => 'Display translation options and language switcher')
        );
    }
    
    /**
     * Widget output
     */
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        $title = !empty($instance['title']) ? $instance['title'] : '${api.name} Translation';
        echo $args['before_title'] . apply_filters('widget_title', $title) . $args['after_title'];
        
        $widget_type = !empty($instance['widget_type']) ? $instance['widget_type'] : 'language_switcher';
        
        switch ($widget_type) {
            case 'language_switcher':
                echo do_shortcode('[${pluginSlug}_language_switcher style="list"]');
                break;
                
            case 'translate_form':
                $this->render_translate_form();
                break;
        }
        
        echo $args['after_widget'];
    }
    
    /**
     * Widget form
     */
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : '${api.name} Translation';
        $widget_type = !empty($instance['widget_type']) ? $instance['widget_type'] : 'language_switcher';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Title:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('widget_type'); ?>">Widget Type:</label>
            <select class="widefat" id="<?php echo $this->get_field_id('widget_type'); ?>" name="<?php echo $this->get_field_name('widget_type'); ?>">
                <option value="language_switcher" <?php selected($widget_type, 'language_switcher'); ?>>Language Switcher</option>
                <option value="translate_form" <?php selected($widget_type, 'translate_form'); ?>>Translation Form</option>
            </select>
        </p>
        <?php
    }
    
    /**
     * Update widget
     */
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['widget_type'] = (!empty($new_instance['widget_type'])) ? strip_tags($new_instance['widget_type']) : 'language_switcher';
        
        return $instance;
    }
    
    /**
     * Render translation form
     */
    private function render_translate_form() {
        ?>
        <form class="${pluginSlug}-translate-form" method="post">
            <p>
                <label for="translate_text">Text to translate:</label>
                <textarea id="translate_text" name="translate_text" rows="3" cols="30"></textarea>
            </p>
            <p>
                <label for="source_lang">From:</label>
                <select id="source_lang" name="source_lang">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                </select>
            </p>
            <p>
                <label for="target_lang">To:</label>
                <select id="target_lang" name="target_lang">
                    <option value="es">Spanish</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                </select>
            </p>
            <p>
                <input type="submit" value="Translate" class="button">
            </p>
        </form>
        <div id="translation_result"></div>
        <?php
    }
}
`;
  }

  private generateAdminPage(feature: PlatformFeature, api: ParsedAPI): string {
    const className = api.name.replace(/\s+/g, '_');
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `<?php
/**
 * ${feature.name} Admin Page
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$api_service = new ${className}_API_Service();
$message = '';

// Handle form submission
if ($_POST && wp_verify_nonce($_POST['${pluginSlug}_nonce'], '${pluginSlug}_action')) {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    // Process form based on feature type
    switch ('${feature.name.toLowerCase().replace(/\s+/g, '_')}') {
        case 'api_settings':
            $api_key = sanitize_text_field($_POST['api_key']);
            update_option('${className.toLowerCase()}_api_key', $api_key);
            update_option('${className.toLowerCase()}_enabled', isset($_POST['enabled']));
            $message = 'Settings saved successfully!';
            break;
            
        case 'content_translation':
            // Handle content translation
            $message = 'Translation completed!';
            break;
            
        case 'bulk_translation':
            // Handle bulk translation
            $message = 'Bulk translation started!';
            break;
    }
}

$current_api_key = get_option('${className.toLowerCase()}_api_key', '');
$enabled = get_option('${className.toLowerCase()}_enabled', false);
?>

<div class="wrap">
    <h1><?php echo esc_html('${feature.name}'); ?></h1>
    
    <?php if ($message): ?>
        <div class="notice notice-success is-dismissible">
            <p><?php echo esc_html($message); ?></p>
        </div>
    <?php endif; ?>
    
    <div class="card">
        <h2><?php echo esc_html('${feature.description}'); ?></h2>
        
        <form method="post" action="">
            <?php wp_nonce_field('${pluginSlug}_action', '${pluginSlug}_nonce'); ?>
            
            <table class="form-table">
                ${feature.userInterface?.map(ui => 
                    ui.fields?.map(field => this.generateWordPressFormField(field)).join('\n                ') || ''
                ).join('\n                ')}
            </table>
            
            <?php submit_button('Save Settings'); ?>
        </form>
    </div>
    
    <div class="card">
        <h3>API Status</h3>
        <p>
            <button type="button" id="test-connection" class="button">Test API Connection</button>
            <span id="connection-status"></span>
        </p>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    $('#test-connection').click(function() {
        var button = $(this);
        var status = $('#connection-status');
        
        button.prop('disabled', true).text('Testing...');
        status.html('<span class="spinner is-active"></span>');
        
        $.post(ajaxurl, {
            action: '${pluginSlug}_test_connection',
            nonce: '<?php echo wp_create_nonce("${pluginSlug}_nonce"); ?>'
        }, function(response) {
            if (response.success && response.data.connected) {
                status.html('<span style="color: green;">✓ Connected</span>');
            } else {
                status.html('<span style="color: red;">✗ Connection failed</span>');
            }
        }).always(function() {
            button.prop('disabled', false).text('Test API Connection');
        });
    });
});
</script>
`;
  }

  private generateWordPressFormField(field: any): string {
    switch (field.type) {
      case 'text':
        return `<tr>
                    <th scope="row">
                        <label for="${field.name}">${field.label}</label>
                    </th>
                    <td>
                        <input type="text" id="${field.name}" name="${field.name}" value="<?php echo esc_attr(get_option('${field.name}', '')); ?>" class="regular-text" ${field.required ? 'required' : ''}>
                    </td>
                </tr>`;
      
      case 'checkbox':
        return `<tr>
                    <th scope="row">${field.label}</th>
                    <td>
                        <input type="checkbox" id="${field.name}" name="${field.name}" value="1" <?php checked(get_option('${field.name}', false), true); ?> ${field.required ? 'required' : ''}>
                        <label for="${field.name}">${field.label}</label>
                    </td>
                </tr>`;
      
      case 'select':
        const options = field.options?.map((opt: any) => 
          `<option value="${opt.value}"><?php selected(get_option('${field.name}'), '${opt.value}'); ?>>${opt.label}</option>`
        ).join('\n                            ') || '';
        
        return `<tr>
                    <th scope="row">
                        <label for="${field.name}">${field.label}</label>
                    </th>
                    <td>
                        <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                            ${options}
                        </select>
                    </td>
                </tr>`;
      
      default:
        return '';
    }
  }

  private generateAdminCSS(): string {
    return `.apigatr-admin {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.apigatr-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
}

.apigatr-form-table {
    width: 100%;
    margin-top: 10px;
}

.apigatr-form-table th {
    width: 200px;
    text-align: left;
    padding: 15px 10px 15px 0;
    vertical-align: top;
}

.apigatr-form-table td {
    padding: 15px 10px;
}

.apigatr-button {
    background: #0073aa;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.apigatr-button:hover {
    background: #005177;
}

.apigatr-language-switcher {
    display: inline-block;
    margin: 10px 0;
}

.apigatr-language-switcher .lang-link {
    display: inline-block;
    padding: 5px 10px;
    margin: 0 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
    text-decoration: none;
    color: #333;
    transition: all 0.3s;
}

.apigatr-language-switcher .lang-link:hover,
.apigatr-language-switcher .lang-link.active {
    background: #0073aa;
    color: #fff;
    border-color: #0073aa;
}

.apigatr-translate-form {
    margin: 15px 0;
}

.apigatr-translate-form textarea,
.apigatr-translate-form select,
.apigatr-translate-form input[type="text"] {
    width: 100%;
    margin: 5px 0;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.apigatr-status-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
}

.apigatr-status-connected {
    background: #46b450;
}

.apigatr-status-disconnected {
    background: #dc3232;
}

.apigatr-progress-bar {
    width: 100%;
    height: 20px;
    background: #f0f0f1;
    border-radius: 10px;
    overflow: hidden;
    margin: 10px 0;
}

.apigatr-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0073aa, #005177);
    transition: width 0.3s ease;
}`;
  }

  private generateAdminJS(api: ParsedAPI): string {
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `(function($) {
    'use strict';
    
    // Admin JavaScript for ${api.name} Integration
    
    $(document).ready(function() {
        
        // Test API connection
        $('.test-api-connection').on('click', function(e) {
            e.preventDefault();
            
            var button = $(this);
            var originalText = button.text();
            var statusElement = button.siblings('.connection-status');
            
            button.prop('disabled', true).text('Testing...');
            statusElement.html('<span class="spinner is-active"></span>');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: '${pluginSlug}_test_connection',
                    nonce: ${pluginSlug}_ajax.nonce
                },
                success: function(response) {
                    if (response.success && response.data.connected) {
                        statusElement.html('<span class="apigatr-status-indicator apigatr-status-connected"></span>Connected');
                        button.addClass('button-primary');
                    } else {
                        statusElement.html('<span class="apigatr-status-indicator apigatr-status-disconnected"></span>Connection failed');
                        button.removeClass('button-primary');
                    }
                },
                error: function() {
                    statusElement.html('<span class="apigatr-status-indicator apigatr-status-disconnected"></span>Error testing connection');
                },
                complete: function() {
                    button.prop('disabled', false).text(originalText);
                }
            });
        });
        
        // Translate content
        $('.translate-content').on('click', function(e) {
            e.preventDefault();
            
            var button = $(this);
            var form = button.closest('form');
            var formData = form.serialize();
            
            button.prop('disabled', true).text('Translating...');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData + '&action=${pluginSlug}_translate_content&nonce=' + ${pluginSlug}_ajax.nonce,
                success: function(response) {
                    if (response.success) {
                        showNotice('Translation completed successfully!', 'success');
                        if (response.data.translated_post_id) {
                            window.open('/wp-admin/post.php?post=' + response.data.translated_post_id + '&action=edit', '_blank');
                        }
                    } else {
                        showNotice('Translation failed: ' + response.data, 'error');
                    }
                },
                error: function() {
                    showNotice('Error during translation', 'error');
                },
                complete: function() {
                    button.prop('disabled', false).text('Translate');
                }
            });
        });
        
        // Bulk translation
        $('.bulk-translate').on('click', function(e) {
            e.preventDefault();
            
            if (!confirm('This will translate multiple items. Continue?')) {
                return;
            }
            
            var button = $(this);
            var form = button.closest('form');
            var formData = form.serialize();
            var progressBar = $('.apigatr-progress-bar');
            var progressFill = $('.apigatr-progress-fill');
            
            button.prop('disabled', true).text('Starting bulk translation...');
            progressBar.show();
            progressFill.css('width', '0%');
            
            // Simulate progress (in real implementation, this would be server-sent events or polling)
            var progress = 0;
            var progressInterval = setInterval(function() {
                progress += Math.random() * 20;
                if (progress > 100) progress = 100;
                progressFill.css('width', progress + '%');
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    button.prop('disabled', false).text('Start Bulk Translation');
                    progressBar.hide();
                    showNotice('Bulk translation completed!', 'success');
                }
            }, 500);
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData + '&action=${pluginSlug}_bulk_translate&nonce=' + ${pluginSlug}_ajax.nonce,
                success: function(response) {
                    if (response.success) {
                        showNotice('Bulk translation started successfully!', 'success');
                    } else {
                        showNotice('Bulk translation failed: ' + response.data, 'error');
                        clearInterval(progressInterval);
                        button.prop('disabled', false).text('Start Bulk Translation');
                        progressBar.hide();
                    }
                },
                error: function() {
                    showNotice('Error starting bulk translation', 'error');
                    clearInterval(progressInterval);
                    button.prop('disabled', false).text('Start Bulk Translation');
                    progressBar.hide();
                }
            });
        });
        
        // Language switcher
        $('.language-switcher select').on('change', function() {
            var selectedLang = $(this).val();
            var currentUrl = window.location.href;
            var newUrl = updateUrlParameter(currentUrl, 'lang', selectedLang);
            window.location.href = newUrl;
        });
        
        // Auto-save settings
        $('.auto-save').on('change', function() {
            var field = $(this);
            var value = field.val();
            var name = field.attr('name');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: '${pluginSlug}_save_setting',
                    setting: name,
                    value: value,
                    nonce: ${pluginSlug}_ajax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        field.addClass('setting-saved');
                        setTimeout(function() {
                            field.removeClass('setting-saved');
                        }, 2000);
                    }
                }
            });
        });
    });
    
    // Helper functions
    function showNotice(message, type) {
        var notice = $('<div class="notice notice-' + type + ' is-dismissible"><p>' + message + '</p></div>');
        $('.wrap h1').after(notice);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            notice.fadeOut();
        }, 5000);
    }
    
    function updateUrlParameter(url, param, paramVal) {
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i = 0; i < tempArray.length; i++) {
                if (tempArray[i].split('=')[0] != param) {
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }
        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }
    
})(jQuery);`;
  }

  private generateActivatorClass(api: ParsedAPI): string {
    const className = api.name.replace(/\s+/g, '_');

    return `<?php
/**
 * Plugin Activator Class
 * 
 * @package ${className}_Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ${className}_Activator {
    
    /**
     * Plugin activation
     */
    public static function activate() {
        // Create database tables if needed
        self::create_tables();
        
        // Set default options
        self::set_default_options();
        
        // Schedule cron jobs
        self::schedule_cron_jobs();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Set activation flag
        update_option('${className.toLowerCase()}_activated', true);
    }
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Clear scheduled cron jobs
        self::clear_cron_jobs();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Remove activation flag
        delete_option('${className.toLowerCase()}_activated');
    }
    
    /**
     * Create database tables
     */
    private static function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . '${className.toLowerCase()}_translations';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id int(11) NOT NULL AUTO_INCREMENT,
            post_id int(11) NOT NULL,
            original_text longtext NOT NULL,
            translated_text longtext NOT NULL,
            source_language varchar(10) NOT NULL,
            target_language varchar(10) NOT NULL,
            translation_date datetime DEFAULT CURRENT_TIMESTAMP,
            translation_hash varchar(32) NOT NULL,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY translation_hash (translation_hash),
            KEY languages (source_language, target_language)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Create translation cache table
        $cache_table = $wpdb->prefix . '${className.toLowerCase()}_cache';
        
        $cache_sql = "CREATE TABLE $cache_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            cache_key varchar(32) NOT NULL,
            original_text longtext NOT NULL,
            translated_text longtext NOT NULL,
            source_language varchar(10) NOT NULL,
            target_language varchar(10) NOT NULL,
            created_date datetime DEFAULT CURRENT_TIMESTAMP,
            expires_date datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY cache_key (cache_key),
            KEY expires_date (expires_date)
        ) $charset_collate;";
        
        dbDelta($cache_sql);
    }
    
    /**
     * Set default options
     */
    private static function set_default_options() {
        $default_options = array(
            '${className.toLowerCase()}_api_key' => '',
            '${className.toLowerCase()}_enabled' => false,
            '${className.toLowerCase()}_auto_translate' => false,
            '${className.toLowerCase()}_cache_enabled' => true,
            '${className.toLowerCase()}_cache_duration' => 7, // days
            '${className.toLowerCase()}_default_source_lang' => 'en',
            '${className.toLowerCase()}_default_target_lang' => 'es',
            '${className.toLowerCase()}_batch_size' => 10,
            '${className.toLowerCase()}_rate_limit' => 100 // requests per hour
        );
        
        foreach ($default_options as $option => $value) {
            if (get_option($option) === false) {
                add_option($option, $value);
            }
        }
    }
    
    /**
     * Schedule cron jobs
     */
    private static function schedule_cron_jobs() {
        // Schedule cache cleanup
        if (!wp_next_scheduled('${className.toLowerCase()}_cleanup_cache')) {
            wp_schedule_event(time(), 'daily', '${className.toLowerCase()}_cleanup_cache');
        }
        
        // Schedule usage analytics
        if (!wp_next_scheduled('${className.toLowerCase()}_sync_usage')) {
            wp_schedule_event(time(), 'hourly', '${className.toLowerCase()}_sync_usage');
        }
    }
    
    /**
     * Clear cron jobs
     */
    private static function clear_cron_jobs() {
        wp_clear_scheduled_hook('${className.toLowerCase()}_cleanup_cache');
        wp_clear_scheduled_hook('${className.toLowerCase()}_sync_usage');
    }
}

// Add cron job handlers
add_action('${className.toLowerCase()}_cleanup_cache', function() {
    global $wpdb;
    $table_name = $wpdb->prefix . '${className.toLowerCase()}_cache';
    $wpdb->query("DELETE FROM $table_name WHERE expires_date < NOW()");
});

add_action('${className.toLowerCase()}_sync_usage', function() {
    // Sync usage statistics with API if needed
    $api_service = new ${className}_API_Service();
    $usage = $api_service->make_request('/usage');
    if (!is_wp_error($usage)) {
        update_option('${className.toLowerCase()}_usage_stats', $usage);
    }
});
`;
  }

  private extractBaseUrl(api: ParsedAPI): string {
    // Extract base URL from the first endpoint or use a default
    if (api.endpoints.length > 0) {
      const firstEndpoint = api.endpoints[0];
      const path = firstEndpoint.path;
      // For DeepL API, we know the base URL
      if (path.includes('/translate') || path.includes('/usage')) {
        return 'https://api-free.deepl.com/v2';
      }
    }
    return 'https://api.example.com';
  }

  private generateWordPressConfig(api: ParsedAPI, intelligence?: WordPressIntelligence): Record<string, any> {
    return {
      phpVersion: '7.4+',
      wordpressVersion: '5.0+',
      requiredPlugins: [],
      recommendedPlugins: ['WPML', 'Polylang'],
      permissions: {
        'manage_options': 'Required for plugin settings',
        'edit_posts': 'Required for content translation',
        'edit_pages': 'Required for page translation'
      },
      hooks: {
        activation: 'Plugin activation and database setup',
        deactivation: 'Cleanup and unscheduling',
        uninstall: 'Complete data removal'
      },
      endpoints: api.endpoints.map(e => ({
        id: e.id,
        wordpressAction: `wp_ajax_${api.name.toLowerCase().replace(/\s+/g, '_')}_${e.id.replace(/[^a-zA-Z0-9]/g, '_')}`,
        capability: 'edit_posts'
      }))
    };
  }

  private generateDocumentation(api: ParsedAPI, features: PlatformFeature[], intelligence?: WordPressIntelligence): string {
    const pluginName = api.name;
    const pluginSlug = api.name.toLowerCase().replace(/\s+/g, '-');

    return `# ${pluginName} WordPress Plugin

${api.description}

## Installation

1. Upload the plugin files to the \`/wp-content/plugins/${pluginSlug}\` directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Go to ${pluginName} > API Settings to configure your API credentials

## Configuration

### API Settings
1. Navigate to **${pluginName} > API Settings**
2. Enter your ${pluginName} API key
3. Test the connection to ensure it's working
4. Enable the integration

## Features

${features.map(feature => `
### ${feature.name}
${feature.description}

**Available endpoints:** ${feature.apiEndpoints.join(', ')}
**Implementation:** ${feature.implementation}
`).join('')}

## Shortcodes

### Translation Shortcode
\`\`\`
[${pluginSlug}_translate text="Hello World" source="en" target="es"]
\`\`\`

**Parameters:**
- \`text\` (required): Text to translate
- \`source\` (optional): Source language code (default: en)
- \`target\` (required): Target language code
- \`cache\` (optional): Enable caching (default: true)

### Language Switcher
\`\`\`
[${pluginSlug}_language_switcher style="dropdown" show_flags="false"]
\`\`\`

**Parameters:**
- \`style\` (optional): Display style - 'dropdown' or 'list' (default: dropdown)
- \`show_flags\` (optional): Show country flags (default: false)

## Widgets

The plugin includes a **${pluginName} Widget** that can be added to any sidebar or widget area. The widget supports:
- Language switcher
- Quick translation form

## API Integration

### Available Methods

${api.endpoints.map(endpoint => `
#### ${endpoint.name || endpoint.id}
- **Method:** ${endpoint.method}
- **Path:** ${endpoint.path}
- **Description:** ${endpoint.description || 'No description available'}
`).join('')}

## WordPress Hooks

### Actions
- \`${pluginSlug}_before_translation\` - Fired before translation starts
- \`${pluginSlug}_after_translation\` - Fired after translation completes
- \`${pluginSlug}_translation_failed\` - Fired when translation fails

### Filters
- \`${pluginSlug}_translation_text\` - Filter the text before translation
- \`${pluginSlug}_translated_result\` - Filter the translation result
- \`${pluginSlug}_supported_languages\` - Filter the list of supported languages

## Database Tables

The plugin creates the following database tables:

### wp_${pluginSlug.replace(/-/g, '_')}_translations
Stores translation history and cache

### wp_${pluginSlug.replace(/-/g, '_')}_cache
Stores translation cache for improved performance

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify your API key is correct
   - Check your server can make outbound HTTPS requests
   - Ensure your API key has sufficient quota

2. **Translations Not Appearing**
   - Check if the plugin is enabled
   - Verify the source and target languages are supported
   - Check the WordPress error logs

3. **Performance Issues**
   - Enable translation caching in settings
   - Reduce batch size for bulk translations
   - Consider upgrading your ${pluginName} plan

## Support

For support and documentation, visit:
- Plugin settings page for connection testing
- WordPress admin logs for error details
- ${pluginName} API documentation for API-specific issues

## Security

The plugin implements WordPress security best practices:
- Nonce verification for all forms
- Capability checks for admin functions
- Input sanitization and output escaping
- Prepared SQL statements

## Performance

- Translation results are cached by default
- Bulk operations are batched to prevent timeouts
- AJAX requests for real-time translations
- Cron jobs for cache cleanup and maintenance
`;
  }
}