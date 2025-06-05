---
permalink: /
---

# About Me

I am a NLP researcher focusing on **Trustworthy AI and MLLM/LLM security**. Currently, I am a third-year Computer Science student at the [University of Toronto](https://www.utoronto.ca/). It's pleasure to collaborate with [PRADA](https://pradalab1.github.io/research.html) Lab at King Abdullah University of Science and Technology(KAUST).

# News

{% for news in site.data.news %}
- {{ news.date }}: {{ news.description }}
{% endfor %}

# Publications

{% for pub in site.data.publications %}
## {{ pub.title }}

{{ pub.authors | join: ", " }}

*{{ pub.venue }}*

{% if pub.description %}
{{ pub.description }}
{% endif %}

{% if pub.links %}
[{% for link in pub.links %}[{{ link.name }}]({{ link.url }}){% unless forloop.last %} | {% endunless %}{% endfor %}]
{% endif %}

{% endfor %}

# Experience

{% for exp in site.data.employment %}
## {{ exp.company }}
{{ exp.description }}
*{{ exp.dates }}*

{% endfor %}

# Education

{% for edu in site.data.education %}
## {{ edu.name }}
{{ edu.description }}
*{{ edu.dates }}*

{% endfor %} 