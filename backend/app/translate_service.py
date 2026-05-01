import requests

def translate_text(text, target):
    try:
        url = "https://translate.argosopentech.com/translate"

        payload = {
            "q": text,
            "source": "en",
            "target": target,
            "format": "text"
        }

        headers = {
            "Content-Type": "application/json"
        }

        res = requests.post(url, json=payload, headers=headers, timeout=5)

        if res.status_code != 200:
            print("Translation failed:", res.text)
            return text

        data = res.json()
        return data.get("translatedText", text)

    except Exception as e:
        print("Translation error:", e)
        return text