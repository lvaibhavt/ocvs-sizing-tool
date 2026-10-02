# OCVS Sizing Tool

## ▶ Open the tool: **https://lvaibhavt.github.io/ocvs-sizing-tool/**

Two layouts, same inputs and numbers (switch at the top of the page):
- **View 1 · Cards** (default): https://lvaibhavt.github.io/ocvs-sizing-tool/
- **View 2 · Table** (navy/gold comparison table, like VMware Cloud Pricing Compare): https://lvaibhavt.github.io/ocvs-sizing-tool/?view=2

This tool sizes a VMware workload by host shape across four clouds:

- **Oracle Cloud VMware Solution (OCVS)**
- **Azure VMware Solution (AVS)**
- **Google Cloud VMware Engine (GCVE)**
- **Amazon Elastic VMware Service (EVS)**

It sizes every host shape, prices it, and recommends the cheapest fit on each cloud.

Prices come **directly from each vendor**, not from other tools:

| Cloud | Hosts | Storage |
|---|---|---|
| OCVS | Oracle OCVS pricing reference (monthly per node at 744 hours, on-demand / 1-year / 3-year), kept in `OCVS_REFERENCE` in `tools/fetch_prices.py` | Block Volume, File Storage ([Oracle Cloud price list API](https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/)) |
| AVS | [Azure Retail Prices API](https://prices.azure.com/api/retail/prices) (VCF BYOL, all regions) | Elastic SAN, Azure NetApp Files (same API) |
| GCVE | [VMware Engine pricing page](https://cloud.google.com/vmware-engine/pricing) (every region's table) | Storage-only nodes (same page), [NetApp Volumes](https://cloud.google.com/netapp/volumes/pricing), [Filestore](https://cloud.google.com/filestore/pricing) |
| Amazon EVS | [AWS Price List](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEVS/current/region_index.json) (EVS fee) + AWS pricing-page data (EC2 on-demand, EC2 Instance Savings Plans, Dedicated Host) | FSx for NetApp ONTAP (AWS Price List) |

### Refreshing prices

```bash
python tools/fetch_prices.py
```

This rewrites `data/prices.js` (a few minutes; no credentials needed). Commit the file and the site updates. Host specs, regions and storage documentation live in `data/catalog.js`.

**OCVS host prices** come from Oracle's OCVS pricing reference (e.g. BM.DenseIO.E4.128: $7,142.40 on-demand, $4,642.56 1-year, $3,571.20 3-year per node per month at 744 hours). The public price-list API's per-OCPU OCVS SKUs don't match that reference, so they aren't used for hosts. When Oracle updates OCVS pricing, edit `OCVS_REFERENCE` and re-run the script.

## Simple by default, advanced when you need it

Out of the box the tool uses the basics: **3-year commitment with monthly payments, 744 hours per month, Frankfurt, 4x vCPU/core overcommit, 1x RAM overcommit (none), vSAN RAID-5**, with no growth buffer, HA spare host, free-space headroom or RAM reservation, and the **base additional storage** on each cloud (the cheapest option that suits running VMs), used only when it costs less than adding vSAN hosts:

| Cloud | Default additional storage (Frankfurt) |
|---|---|
| OCVS | OCI Block Volume · Balanced (10 VPU) |
| AVS | Azure Elastic SAN · Premium LRS |
| GCVE | Cheapest of Google Cloud NetApp Volumes Standard and storage-only vSAN nodes |
| Amazon EVS | FSx for NetApp ONTAP · Single-AZ SSD |

Switch on **Advanced configuration** to change the commitment, hours, regions, sizing assumptions, the storage option per cloud, and a **storage discount %** per cloud (every tier, e.g. OCI 20/30/40/50 VPU). Each storage option shows its protocol, media, size limits, price, IOPS and throughput per TiB, per-volume maximums, notes and documentation links. Switching Advanced off goes back to the defaults; your advanced values come back when you switch it on again.

**Download PPT** (both views) builds a comparison slide and an assumptions & sources slide in the same style as VMware Cloud Pricing Compare.

## How to use it

1. Choose one input method:
   - **Upload an RVTools report** (`.xlsx`). The tool reads the `vInfo` sheet and totals vCPU, RAM and storage. You can include only powered-on VMs, and use either in-use or provisioned storage. The file stays in your browser.
   - **Enter the numbers manually**: total vCPU, RAM (GB) and storage (TB).
2. Choose the commitment (3-year by default), hours per month (744), and for each cloud the region and, if you want it, an additional storage option.
3. Optionally, adjust the sizing assumptions: vCPU:core ratio, growth, N+1 HA, vSAN policy, slack and dedup.
4. Click **Size and price it**.

## What you get

- **Workload profile**: CPU-heavy, memory-heavy, storage-heavy or balanced.
- **Cheapest shape and host count for each cloud**, with monthly, annual and term cost, and the difference against OCVS, plus the resulting cores, RAM and usable vSAN capacity.
- **Sizing driver**: CPU, RAM, storage or minimum cluster size.
- **Storage-heavy workloads**: when it is cheaper, hosts are sized for compute only and the rest of the storage (in TB, with its monthly cost) goes on external storage. That's OCI Block Volume, Azure NetApp Files or Elastic SAN, Google Cloud NetApp Volumes, or FSx for NetApp ONTAP.
- **A table of every shape**, so you can see the trade-offs.

## Sizing logic

- Compute hosts = max(vCPU ÷ (cores × ratio), RAM ÷ usable host RAM), rounded up, plus HA spares.
- Storage hosts = storage ÷ (raw TB × (1 − slack) ÷ policy factor × dedup), rounded up. If the cluster is too small for RAID-5 or RAID-6, RAID-1 is used instead.
- Hosts = max(compute hosts, storage hosts, provider minimum). The minimum is 3 hosts on OCVS, AVS and GCVE, and 4 on EVS.
- **Additional storage is an explicit choice per cloud** (Pricing toggle). The default is *None*: all storage on vSAN, adding hosts until it fits.
- If you pick an option (OCI Block Volume, Azure Elastic SAN or NetApp Files, Google NetApp Volumes or Filestore, Amazon FSx for ONTAP, or **GCVE storage-only vSAN nodes**), hosts are sized for compute and the rest of the storage goes there, with the same free-space headroom.
- GCVE storage-only nodes match the ve2 size class (e.g. `ve2-mega-so` with `ve2-mega-*`), are at most 50% of the cluster, and use the same commitment term as the hosts.
- Shapes with no local vSAN (such as OCVS Standard shapes) are only sized when additional storage is chosen.
- The recommended shape per cloud is the cheapest total. Shapes without a published price for the region and commitment are skipped.
- Pricing is BYOL. It excludes VCF licences, networking, egress, backup, support, taxes and FSx throughput capacity. External storage is pay-as-you-go.

## Host shapes

Host shapes and specs are in `data/catalog.js`; prices in `data/prices.js`. GPU shapes are excluded.

It's a static single-page app with no backend, hosted on GitHub Pages.

## Confluence edition

A self-contained version for an internal Confluence (Data Center) page, with no internet dependencies (the Excel reader, PowerPoint library, catalog and prices are all inside one file):

```bash
python tools/build_confluence.py
```

This writes `dist/confluence/` (not stored in the repo; build it when you need it):
- `ocvs-sizer-tool.js`: attach it to the Confluence page.
- `confluence-macro.html`: paste its contents into an **HTML** macro on that page.
- `preview.html`: local preview that mimics Confluence.

The tool renders in its own shadow root, so Confluence styles don't affect it. To update prices on Confluence: run `tools/fetch_prices.py`, rebuild, and upload the new `ocvs-sizer-tool.js` to the page (Confluence keeps the old versions as attachment history).
