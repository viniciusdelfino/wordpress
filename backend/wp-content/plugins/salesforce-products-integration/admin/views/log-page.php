
<div class="cron-status">
    <h2><?php esc_html_e('Cron Jobs Status', 'salesforce-products'); ?></h2>
    
    <?php
    $plugin = sf_products_integration();
    $cron_status = Cron_Manager::get_cron_status();
    ?>
    
    <table class="widefat fixed">
        <thead>
            <tr>
                <th><?php esc_html_e('Job', 'salesforce-products'); ?></th>
                <th><?php esc_html_e('Status', 'salesforce-products'); ?></th>
                <th><?php esc_html_e('Next Run', 'salesforce-products'); ?></th>
                <th><?php esc_html_e('Actions', 'salesforce-products'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($cron_status as $job_name => $job_info): ?>
            <tr>
                <td>
                    <strong><?php echo esc_html(str_replace('_', ' ', $job_name)); ?></strong>
                </td>
                <td>
                    <span class="status-badge <?php echo $job_info['scheduled'] ? 'status-active' : 'status-inactive'; ?>">
                        <?php echo $job_info['scheduled'] ? 
                            esc_html__('Scheduled', 'salesforce-products') : 
                            esc_html__('Not Scheduled', 'salesforce-products'); ?>
                    </span>
                </td>
                <td>
                    <?php if ($job_info['scheduled']): ?>
                        <span class="next-run">
                            <?php echo esc_html($job_info['next_formatted']); ?>
                            <br>
                            <small><?php echo esc_html($job_info['next_relative']); ?></small>
                        </span>
                    <?php else: ?>
                        <em><?php esc_html_e('Not scheduled', 'salesforce-products'); ?></em>
                    <?php endif; ?>
                </td>
                <td>
                    <?php if ($job_name === 'daily_sync'): ?>
                        <button class="button button-small run-now-btn" 
                                data-job="daily_sync">
                            <?php esc_html_e('Run Now', 'salesforce-products'); ?>
                        </button>
                    <?php endif; ?>
                    
                    <?php if ($job_name === 'hourly_check'): ?>
                        <button class="button button-small run-now-btn" 
                                data-job="hourly_check">
                            <?php esc_html_e('Run Now', 'salesforce-products'); ?>
                        </button>
                    <?php endif; ?>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    
    <div class="cron-actions">
        <button class="button" id="schedule-all-cron">
            <?php esc_html_e('Schedule All Jobs', 'salesforce-products'); ?>
        </button>
        
        <button class="button" id="unschedule-all-cron">
            <?php esc_html_e('Unschedule All Jobs', 'salesforce-products'); ?>
        </button>
        
        <button class="button" id="force-daily-sync">
            <?php esc_html_e('Force Daily Sync', 'salesforce-products'); ?>
        </button>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    $('.run-now-btn').on('click', function() {
        var job = $(this).data('job');
        var button = $(this);
        
        button.prop('disabled', true).text('Running...');
        
        $.post(ajaxurl, {
            action: 'salesforce_run_cron_job',
            job: job,
            nonce: salesforce_admin.nonce
        }, function(response) {
            if (response.success) {
                alert('Job executed successfully');
                location.reload();
            } else {
                alert('Error: ' + response.data);
            }
            button.prop('disabled', false).text('Run Now');
        });
    });
});
</script>