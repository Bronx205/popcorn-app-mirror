<% var p_rating = Math.round(rating.percentage) /20 ; %>
	
<div id ="<%= imdb_id %>">
	<img class="cover-image" src="<%= images.poster %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<i class="fa fa-heart actions-favorites"></i>
			<div class="rating" <% if(Settings.coversShowRating){ %> style="display: block;"<% } %> >
				<div class="rating-stars">
					<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
						<i class="fa fa-star rating-star"></i>
					<% }; %>
					<% if (p_rating % 1 > 0) { %>
						<span class = "fa-stack rating-star-half-container">
							<i class="fa fa-star fa-stack-1x rating-star-half-empty"></i>
							<i class="fa fa-star-half fa-stack-1x rating-star-half"></i>
						</span>
					<% }; %>
					<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
						<i class="fa fa-star rating-star-empty"></i>
					<% }; %>
				</div>
				<div class="rating-value"><%= Math.round(rating.percentage) / 10 %>/10</div>
			</div>
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	<% if(num_seasons == undefined) var num_seasons = 0 %>
	<p class="seasons"><%= num_seasons %> <%= num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %></p>
</div>