# import pandas as pd
# from typing import Dict, Tuple
# from engine.engine import Plan, target_weights, build_trade_plan

# @dataclass
# class Plan:
#     regime: str
#     direction_bias: str
#     universe: List[str]
#     gates: dict
#     custom_rules: List[str]
#     weighting: dict
#     rebalance: dict
#     risk: dict
#     execution: dict
#     sentiment_cfg: dict


# def run_backtest(plan: Plan, ohlcv: Dict[str,pd.DataFrame], sentiment: Dict[str,pd.Series],
#                  start=None, end=None) -> Tuple[pd.DataFrame, dict]:
#     # Align index across assets
#     idx = None
#     for df in ohlcv.values():
#         idx = df.index if idx is None else idx.intersection(df.index)
#     if start: idx = idx[idx >= pd.to_datetime(start, utc=True)]
#     if end:   idx = idx[idx <= pd.to_datetime(end, utc=True)]
#     if idx is None or len(idx) < 60:
#         return pd.DataFrame(columns=["equity"]), {"error":"not enough data"}

#     cadence = plan.rebalance.get("cadence","weekly")
#     if cadence=="weekly":
#         rb_dates = pd.date_range(idx[0], idx[-1], freq="W-FRI")
#     elif cadence=="daily":
#         rb_dates = idx
#     else:
#         rb_dates = pd.date_range(idx[0], idx[-1], freq="M")

#     value = 1_000_000.0; cash = value; holdings = {a:0.0 for a in ohlcv}
#     band_pp = plan.rebalance.get("band_pp", 5.0)
#     turn_cap = plan.rebalance.get("turnover_max", 0.15)

#     def weights_now(prices):
#         port = cash + sum(holdings[a]*prices[a] for a in ohlcv)
#         return {a: (holdings[a]*prices[a])/port if port>0 else 0.0 for a in ohlcv}

#     curve = []
#     for t in idx:
#         px = {a: ohlcv[a].loc[t,"close"] for a in ohlcv}
#         port = cash + sum(holdings[a]*px[a] for a in ohlcv)
#         curve.append((t, port))

#         if t in rb_dates:
#             tw, _ = target_weights(plan, {a: ohlcv[a].loc[:t].iloc[-250:] for a in ohlcv},
#                                    {a: (sentiment.get(a).loc[:t] if a in sentiment else None) for a in ohlcv})
#             if not tw: continue
#             cw = weights_now(px)
#             dollars = build_trade_plan(cw, tw, port, band_pp)
#             turnover = sum(abs(v) for v in dollars.values())
#             scale = min(1.0, (turn_cap*port/turnover) if turnover>0 else 0.0)
#             for a, d in dollars.items():
#                 d *= scale
#                 if d > 0 and cash >= d:
#                     units = d/(px[a]+1e-9); holdings[a]+=units; cash-=d
#                 elif d < 0:
#                     sell = min(-d, holdings[a]*px[a]); units = sell/(px[a]+1e-9)
#                     holdings[a]-=units; cash+=sell

#     ec = pd.DataFrame(curve, columns=["time","equity"]).set_index("time")
#     ret = ec["equity"].iloc[-1]/ec["equity"].iloc[0]-1
#     vol = ec["equity"].pct_change().std()*365**0.5
#     dd = (ec["equity"]/ec["equity"].cummax()-1).min()
#     sharpe = (ec["equity"].pct_change().mean()*365) / (vol+1e-9)
#     stats = {"TotalReturn": float(ret),
#              "CAGR_est": float((1+ret)**(365/len(ec))-1),
#              "MaxDD": float(dd), "Vol": float(vol), "Sharpe": float(sharpe)}
#     return ec, stats

