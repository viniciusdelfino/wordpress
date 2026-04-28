jQuery(function ($) {
  let mediaFrame;

  $(document).on('click', '#upload-category-image', function (event) {
    event.preventDefault();

    if (mediaFrame) {
      mediaFrame.open();
      return;
    }

    mediaFrame = wp.media({
      title: 'Selecionar imagem',
      button: {
        text: 'Usar esta imagem',
      },
      multiple: false,
    });

    mediaFrame.on('select', function () {
      const attachment = mediaFrame.state().get('selection').first().toJSON();
      $('#category_image_id').val(attachment.id);
      $('#category-image-preview').html(
        '<img src="' + attachment.url + '" style="max-width: 200px; height: auto;">'
      );
      $('#remove-category-image').show();
    });

    mediaFrame.open();
  });

  $(document).on('click', '#remove-category-image', function (event) {
    event.preventDefault();
    $('#category_image_id').val('');
    $('#category-image-preview').html('');
    $(this).hide();
  });
});
