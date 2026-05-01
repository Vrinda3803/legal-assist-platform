import requests


def fetch_legal_news():
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": '("Supreme Court India" OR "High Court India" OR "Indian law" OR "court ruling" OR "legal case India" OR "judgment India")',
        "sortBy": "publishedAt",
        "domains": "barandbench.com, livelaw.in, indiatoday.in, thehindu.com, indianexpress.com",
        "language": "en",
        "pageSize": 6,
        "apiKey": "7a38975a8ad940538b516452063c8075",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        articles = []
        for item in data.get("articles", []):
            title = item.get("title")
            link = item.get("url")
            source = item.get("source", {}).get("name", "Unknown")
            published = item.get("publishedAt", "")[:10]

            if title and link:
                articles.append(
                    {
                        "title": title,
                        "link": link,
                        "source": source,
                        "published": published,
                    }
                )

        return articles

    except Exception:
        return []