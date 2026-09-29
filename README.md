# OCVS Sizing Tool

## ▶ Open the tool: **https://lvaibhavt.github.io/ocvs-sizing-tool/**

This tool sizes a VMware workload by host shape across four clouds:

- **Oracle Cloud VMware Solution (OCVS)**
- **Azure VMware Solution (AVS)**
- **Google Cloud VMware Engine (GCVE)**
- **Amazon Elastic VMware Service (EVS)**

It sizes shapes only and doesn't compare prices.

## How to use it

1. Choose one input method:
   - **Upload an RVTools report** (`.xlsx`). The tool reads the `vInfo` sheet and totals vCPU, RAM and storage. You can include only powered-on VMs, and use either in-use or provisioned storage. The file stays in your browser.
   - **Enter the numbers manually**: total vCPU, RAM (GB) and storage (TB).
2. Optionally, adjust the sizing assumptions: vCPU:core ratio, growth, N+1 HA, vSAN policy, slack and dedup.
3. Click **Size it**.

## What you get

- **Workload profile**: CPU-heavy, memory-heavy, storage-heavy or balanced.
- **Recommended shape and host count for each cloud**, with the resulting cores, RAM, and raw and usable vSAN capacity.
- **Sizing driver**: CPU, RAM, storage or minimum cluster size.
- **For storage-driven results**: an alternative that sizes hosts for compute only and puts the extra storage (in TB) on external storage. That's OCI Block Volume, Azure NetApp Files or Elastic SAN, Google Cloud NetApp Volumes, or FSx for NetApp ONTAP.
- **A table of every shape**, so you can see the trade-offs.

## Sizing logic

- Compute hosts = max(vCPU ÷ (cores × ratio), RAM ÷ usable host RAM), rounded up, plus HA spares.
- Storage hosts = storage ÷ (raw TB × (1 − slack) ÷ policy factor × dedup), rounded up. If the cluster is too small for RAID-5 or RAID-6, RAID-1 is used instead.
- Hosts = max(compute hosts, storage hosts, provider minimum). The minimum is 3 hosts on OCVS, AVS and GCVE, and 4 on EVS.
- The recommended shape per cloud is the one with the **fewest total physical cores**. Cores work as a cost proxy because VCF licensing and host pricing both scale with them. Ties go to the fewest hosts.

## Host shapes

The shapes are defined in the `SHAPES` array in `index.html`. Shapes marked **verify** have specs you should confirm with the provider. To add or update a shape, edit one line.

It's a static single-page app with no backend, hosted on GitHub Pages.
