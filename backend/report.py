# backend/report.py
import os
from jinja2 import Environment, FileSystemLoader
from database import SessionLocal, PredictionORM, PredictionOutcomeORM
import pandas as pd
import argparse
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("report")

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(TEMPLATES_DIR, exist_ok=True)
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

# create a simple template if not exists
template_path = os.path.join(TEMPLATES_DIR, "daily_report.html")
if not os.path.exists(template_path):
    with open(template_path, "w", encoding="utf-8") as f:
        f.write("""
<html><head><meta charset="utf-8"><title>Daily Report</title></head><body>
<h1>Daily Report - {{ date }}</h1>
<h2>Predictions</h2>
<table border="1"><tr><th>id</th><th>ts</th><th>ticker</th><th>rec</th><th>conf</th><th>price</th></tr>
{% for p in preds %}
<tr><td>{{p.id}}</td><td>{{p.ts}}</td><td>{{p.ticker}}</td><td>{{p.rec}}</td><td>{{p.conf}}</td><td>{{p.price}}</td></tr>
{% endfor %}
</table>
<h2>Outcomes</h2>
<table border="1"><tr><th>pred_id</th><th>returned</th><th>success</th></tr>
{% for o in outs %}
<tr><td>{{o.prediction_id}}</td><td>{{o.returned}}</td><td>{{o.success}}</td></tr>
{% endfor %}
</table>
</body></html>
""")

def generate_daily_report(date_str: str):
    db = SessionLocal()
    preds = db.query(PredictionORM).all()
    outs = db.query(PredictionOutcomeORM).all()
    db.close()
    tpl = env.get_template("daily_report.html")
    html = tpl.render(date=date_str, preds=[p.__dict__ for p in preds], outs=[o.__dict__ for o in outs])
    out_dir = os.path.join(os.path.dirname(__file__), "reports")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"daily-{date_str}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    logger.info("Report generated: %s", out_path)
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", required=False, default=None)
    args = parser.parse_args()
    date = args.date or pd.Timestamp.utcnow().strftime("%Y-%m-%d")
    generate_daily_report(date)
