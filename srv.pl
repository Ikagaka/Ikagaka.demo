use Mojolicious::Lite;

push @{app->static->paths}, '.';
app->start;
