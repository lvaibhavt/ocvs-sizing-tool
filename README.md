# OCVS Sizing Tool

## ▶ Open the tool: **https://lvaibhavt.github.io/ocvs-sizing-tool/**

This tool sizes a VMware workload by host shape across four clouds:

- **Oracle Cloud VMware Solution (OCVS)**
- **Azure VMware Solution (AVS)**
- **Google Cloud VMware Engine (GCVE)**
- **Amazon Elastic VMware Service (EVS)**

It sizes every host shape, prices it, and recommends the cheapest fit on each cloud.

Prices come live from two companion tools, so updating them there updates this tool too:
- Host prices: [VMware Cloud Pricing Compare](https://lvaibhavt.github.io/vmware-cloud-pricing-compare/) (`data/pricing.js`, `data/regional-prices.js`)
- External storage prices: [OCVS External Storage Pricing](https://lvaibhavt.github.io/ocvs-external-storage-pricing/) (`data/storage.js`, `data/regions.js`)

## How to use it

1. Choose one input method:
   - **Upload an RVTools report** (`.xlsx`). The tool reads the `vInfo` sheet and totals vCPU, RAM and storage. You can include only powered-on VMs, and use either in-use or provisioned storage. The file stays in your browser.
   - **Enter the numbers manually**: total vCPU, RAM (GB) and storage (TB).
2. Choose the commitment (3-year by default), hours per month (744), and for each cloud the region and the external storage option.
3. Optionally, adjust the sizing assumptions: vCPU:core ratio, growth, N+1 HA, vSAN policy, slack and dedup.
4. Click **Size and price it**.

## What you get

- **Workload profile**: CPU-heavy, memory-heavy, storage-heavy or balanced.
- **Cheapest shape and host count for each cloud**, with monthly, annual and term cost, and the difference against OCVS,, with the resulting cores, RAM, and raw and usable vSAN capacity.
- **Sizing driver**: CPU, RAM, storage or minimum cluster size.
- **For storage-driven results**: an alternative that sizes hosts for compute only and puts the extra storage (in TB) on external storage. That's OCI Block Volume, Azure NetApp Files or Elastic SAN, Google Cloud NetApp Volumes, or FSx for NetApp ONTAP.
- **A table of every shape**, so you can see the trade-offs.

## Sizing logic

- Compute hosts = max(vCPU ÷ (cores × ratio), RAM ÷ usable host RAM), rounded up, plus HA spares.
- Storage hosts = storage ÷ (raw TB × (1 − slack) ÷ policy factor × dedup), rounded up. If the cluster is too small for RAID-5 or RAID-6, RAID-1 is used instead.
- Hosts = max(compute hosts, storage hosts, provider minimum). The minimum is 3 hosts on OCVS, AVS and GCVE, and 4 on EVS.
- Each shape is priced two ways: all storage on vSAN, or hosts sized for compute plus external storage for the rest (with the same free-space headroom). The cheaper plan counts.
- Shapes with no vSAN (such as OCVS Standard shapes) always use external storage (OCI Block Volume).
- The recommended shape per cloud is the cheapest total. Shapes without a published price for the region and commitment are skipped.
- Pricing is BYOL. It excludes VCF licences, networking, egress, backup, support, taxes and FSx throughput capacity. External storage is pay-as-you-go.

## Host shapes

Host shapes, specs and prices come from the node pricing tool's data files. GPU shapes are excluded.

It's a static single-page app with no backend, hosted on GitHub Pages.
