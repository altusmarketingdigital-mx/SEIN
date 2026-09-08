jQuery( function ($) {
	var $datePickers            = $( '#_yith_wcbm_badge_from_date , #_yith_wcbm_badge_to_date' ),
		$badgeSelect            = $( '#_yith_wcbm_badge_ids' ),
		updateDatePickersRanges = function () {
			if ( '_yith_wcbm_badge_from_date' === $( this ).attr( 'id' ) ) {
				$( '#_yith_wcbm_badge_to_date' ).datepicker( 'option', 'minDate', $( this ).val() );
			} else {
				$( '#_yith_wcbm_badge_from_date' ).datepicker( 'option', 'maxDate', $( this ).val() );
			}
		},
		handleBadgeSelection    = function () {
			if ( $badgeSelect.val() ) {
				$badgeSelect.addClass( 'yith-wcbm-badge-id--selected' );
			} else {
				$badgeSelect.removeClass( 'yith-wcbm-badge-id--selected' );
			}
		};

	$datePickers.on( 'change', updateDatePickersRanges );
	$badgeSelect.on( 'change', handleBadgeSelection );

	$datePickers.trigger( 'change' );
	$badgeSelect.trigger( 'change' );
} );
