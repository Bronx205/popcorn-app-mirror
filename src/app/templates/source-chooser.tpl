<ul class="nav nav-hor left">
  <% _.each(items, function(item){ %>
	<li class="selectable source" id="<%= item.id %>">
            <%= item.name %>
        </li>
  <% }); %>
</ul>