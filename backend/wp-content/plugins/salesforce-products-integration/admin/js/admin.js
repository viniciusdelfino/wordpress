jQuery(document).ready(function($) {
    // Test Connection Button
    $('.test-connection-btn').on('click', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var environment = button.data('environment') || $('#current-environment').val();
        
        button.prop('disabled', true).text('Testing...');
        
        $.ajax({
            url: salesforce_admin.ajaxurl,
            type: 'POST',
            data: {
                action: 'salesforce_test_connection',
                nonce: salesforce_admin.nonce,
                environment: environment
            },
            success: function(response) {
                if (response.success) {
                    alert('✅ ' + response.data.message);
                    console.log('Details:', response.data.details);
                } else {
                    alert('❌ ' + response.data);
                }
            },
            error: function(xhr, status, error) {
                alert('❌ AJAX Error: ' + error);
            },
            complete: function() {
                button.prop('disabled', false).text('Test Connection');
            }
        });
    });
    
    // Clear Cache Button
    $('#clear-cache-btn').on('click', function() {
        if (confirm('Clear all cache? This will force fresh data from Salesforce.')) {
            var button = $(this);
            button.prop('disabled', true).text('Clearing...');
            
            $.post(salesforce_admin.ajaxurl, {
                action: 'salesforce_clear_cache',
                nonce: salesforce_admin.nonce
            }, function(response) {
                if (response.success) {
                    alert('Cache cleared successfully!');
                    location.reload();
                } else {
                    alert('Error: ' + response.data);
                }
                button.prop('disabled', false).text('Clear Cache');
            });
        }
    });
});