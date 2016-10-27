var fixed_url = "http://content.guardianapis.com/search?order-by=oldest&page=";
var page_number = 1;
var query_string = "&q=%22";
var query = "Search to see graph";
var api_key = "%22&api-key=5ef0fcfb-4090-48c2-bffb-0da3a0008961";
var url, input_field, canvas;
var articles = [];
var firstYear, latestYear;
var bubbleSize = 25;
var loaded_articles;
var offset = 1.2 * bubbleSize;
var baseline = 200;
var total_entries;

var counter = 0;

function setup() {
  input_field = select("#input_field");
  search_button = select("#search_button");
  search_button.mousePressed(query_submitted);

  canvas = createCanvas(960, 5000);
  canvas.parent("#container");
  textAlign(CENTER);
}

function draw() {
  background(20);
  stroke(255);
  line(0, baseline, width, baseline);

  fill(255);
  textSize(28);
  textStyle(NORMAL);
  textFont("Open Sans");
  text(query.toUpperCase(), width / 2, baseline / 2 - 16);

  noStroke();
  textSize(14);

  if (latestYear) {
    text("Showing: " + articles.length + " Total: " + total_entries, width / 2, baseline / 2 + 16);
    for (i = 0; i < articles.length - 1; i++) {
      articles[i].xpos = (map(articles[i].publication_year, firstYear, latestYear, 2 * bubbleSize + offset, width - bubbleSize - offset * 1.5));
      if (i > 0 && articles[i].xpos == articles[i - 1].xpos) {
        articles[i].ypos = articles[i - 1].ypos + offset;
      } else {
        text(articles[i].publication_year, articles[i].xpos, baseline - offset);
        articles[i].ypos = baseline + offset;
      }
      articles[i].display();
    }
  }
  for (i = 0; i < articles.length - 1; i++) {
    if (articles[i].onArticle()) {
      fill(255);
      text(articles[i].title, mouseX, mouseY);
    }
  }
}

function mousePressed() {
  for (i = 0; i < articles.length - 1; i++) {
    if (articles[i].onArticle()) {
      window.open(articles[i].url, '_blank');
    }
  }
}

function query_submitted() {
  articles = [];
  query = input_field.value();
  url = fixed_url + page_number.toString() + query_string + query + api_key;
  loadJSON(url, gotData);
}

function gotData(data) {
  total_entries = data.response.total;
  var page_size = data.response.pageSize;
  var total_pages = data.response.pages;
  var current_page = data.response.currentPage;

  if (current_page == page_number) {
    firstYear = data.response.results[0].webPublicationDate.slice(0, 4);
    getLatestYear(total_pages);
  }

  for (i = 0; i < data.response.results.length; i++) {
    var year = data.response.results[i].webPublicationDate.slice(0, 4);
    var title = data.response.results[i].webTitle;
    var web_url = data.response.results[i].webUrl;
    var article = new Article(year, title, web_url);
    articles.push(article);
  }
  if (current_page < total_pages) {
    url = fixed_url + (current_page + 1).toString() + query_string + query + api_key;
    loadJSON(url, gotData);
  } else {
    console.log(articles);
  }

}

function Article(year, title, web_url) {
  this.publication_year = year;
  this.title = title;
  this.url = web_url;
  this.xpos = 0;
  this.ypos = 0;
  this.display = function() {
    fill(255, 120);
    ellipse(this.xpos, this.ypos, bubbleSize, bubbleSize);
  };
  this.onArticle = function() {
    if (mouseX >= this.xpos - bubbleSize / 2 && mouseX <= this.xpos + bubbleSize / 2) {
      if (mouseY >= this.ypos - bubbleSize / 2 && mouseY <= this.ypos + bubbleSize / 2) {
        return true;
      }
    } else {
      return false;
    }
  };
}

function getLatestYear(page) {
  var last_page_url = fixed_url + page.toString() + query_string + query + api_key;
  loadJSON(last_page_url, latestYearFinder);
}

function latestYearFinder(data) {
  var latestArticleIndex = (data.response.results.length) - 1;
  var latestArticle = data.response.results[latestArticleIndex];
  latestYear = latestArticle.webPublicationDate.slice(0, 4);
}