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

Prices come live from two companion tools, so updating them there updates this tool too:
- Host prices: [VMware Cloud Pricing Compare](https://lvaibhavt.github.io/vmware-cloud-pricing-compare/) (`data/pricing.js`, `data/regional-prices.js`)
- External storage prices: [OCVS External Storage Pricing](https://lvaibhavt.github.io/ocvs-external-storage-pricing/) (`data/storage.js`, `data/regions.js`)

## Simple by default, advanced when you need it

Out of the box the tool uses the basics: **3-year commitment with monthly payments, 744 hours per month, Frankfurt, 4:1 vCPU per core, 1:1 RAM, vSAN RAID-5**, with no growth buffer, HA spare host, free-space headroom or RAM reservation, and the **base additional storage** on each cloud (the cheapest option that suits running VMs), used only when it costs less than adding vSAN hosts:

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

Host shapes, specs and prices come from the node pricing tool's data files. GPU shapes are excluded.

It's a static single-page app with no backend, hosted on GitHub Pages.
