"""
Draw the System Architecture diagram and the Workflow flowchart for the
Cloud-Based Medical Appointment System report, using matplotlib.
Outputs: architecture.png and flowchart.png (high resolution).
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle

# Theme colours
NAVY = '#1F3864'
BLUE = '#2E5496'
LIGHT = '#EEF2F8'
ACCENT = '#C55A11'   # AWS-ish orange for storage
GREEN = '#548235'
GREY = '#7F7F7F'
WHITE = '#FFFFFF'

plt.rcParams['font.family'] = 'DejaVu Sans'


def box(ax, x, y, w, h, text, fc=LIGHT, ec=NAVY, tc='#111111',
        fs=10, bold=False, rounded=0.03, lw=1.6):
    p = FancyBboxPatch((x, y), w, h,
                       boxstyle=f"round,pad=0.01,rounding_size={rounded}",
                       linewidth=lw, edgecolor=ec, facecolor=fc, zorder=2)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha='center', va='center',
            fontsize=fs, color=tc, fontweight='bold' if bold else 'normal',
            zorder=3, wrap=True)


def arrow(ax, x1, y1, x2, y2, color=NAVY, style='-|>', lw=1.8, ls='-',
          rad=0.0, text=None, tx=None, ty=None, tfs=8, tcolor=None):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                        mutation_scale=16, linewidth=lw, color=color,
                        linestyle=ls, connectionstyle=f"arc3,rad={rad}",
                        zorder=1)
    ax.add_patch(a)
    if text:
        ax.text(tx if tx is not None else (x1 + x2) / 2,
                ty if ty is not None else (y1 + y2) / 2,
                text, ha='center', va='center', fontsize=tfs,
                color=tcolor or color, zorder=4,
                bbox=dict(boxstyle='round,pad=0.15', fc='white',
                          ec='none', alpha=0.9))


# ==========================================================================
# 1. SYSTEM ARCHITECTURE
# ==========================================================================
fig, ax = plt.subplots(figsize=(11, 6.6))
ax.set_xlim(0, 100)
ax.set_ylim(0, 66)
ax.axis('off')

# Client
box(ax, 3, 28, 15, 10, "Client\n(Web Browser)\nReact SPA", fc='#DCE6F4',
    ec=BLUE, bold=True, fs=10)

# AWS Cloud outer boundary
ax.add_patch(Rectangle((23, 3), 60, 60, fill=False, edgecolor=ACCENT,
                       linewidth=2.2, linestyle=(0, (6, 4)), zorder=0))
ax.text(24.5, 60.2, "AWS Cloud  (ap-south-1)", fontsize=11, color=ACCENT,
        fontweight='bold', ha='left', va='center')

# VPC boundary
ax.add_patch(Rectangle((27, 15), 40, 42, fill=False, edgecolor=NAVY,
                       linewidth=1.8, linestyle=(0, (3, 3)), zorder=0))
ax.text(28.5, 54.3, "VPC  (Virtual Private Cloud)", fontsize=9.5,
        color=NAVY, fontweight='bold', ha='left', va='center')

# Public subnet - Web server
ax.text(29, 49.5, "Public Subnet", fontsize=8.5, color=BLUE, ha='left')
box(ax, 30, 33, 34, 15,
    "Web Server  —  EC2 (t3.micro)\n\nNginx  (reverse proxy, :80)\nReact build  +  Node/Express API (:5000)\nmanaged by PM2",
    fc=LIGHT, ec=BLUE, fs=9)

# Private subnet - DB server
ax.text(29, 30, "Private Subnet", fontsize=8.5, color=GREEN, ha='left')
box(ax, 30, 17.5, 34, 10,
    "Database Server  —  EC2 (t3.micro)\n\nMongoDB (self-hosted, :27017)",
    fc='#E8F0E1', ec=GREEN, fs=9)

# Amazon S3 (managed, inside AWS but outside VPC)
box(ax, 71, 33, 25, 12,
    "Amazon S3\n\nPrescription files\n(private bucket,\npre-signed URLs)",
    fc='#FBE7D6', ec=ACCENT, fs=9, bold=False)

# IAM note
box(ax, 71, 17.5, 25, 9,
    "AWS IAM\n\nScoped credentials\nfor S3 access",
    fc='#F2F2F2', ec=GREY, fs=8.5)

# Arrows
arrow(ax, 18, 33.5, 30, 39, color=BLUE, text="HTTPS / HTTP :80",
      ty=38.5, tfs=8)
arrow(ax, 30, 36, 18, 31, color=BLUE, rad=0.15)  # response

# Nginx -> Express internal (implicit, same box). Web -> DB
arrow(ax, 47, 33, 47, 27.6, color=GREEN,
      text="MongoDB :27017\n(private IP only)", tx=47, ty=30.3, tfs=7.6,
      tcolor=GREEN)
# Web -> S3
arrow(ax, 64, 41, 71, 40, color=ACCENT, text="AWS SDK v3", ty=43, tfs=8,
      tcolor=ACCENT)
# Web -> IAM
arrow(ax, 64, 35, 71, 24, color=GREY, ls='--', lw=1.3)

# Security-group callout
ax.text(50, 11.5,
        "Security Group: database accepts port 27017 ONLY from the "
        "web server's private IP — no public internet exposure.",
        fontsize=8.4, color=NAVY, ha='center', va='center', style='italic',
        bbox=dict(boxstyle='round,pad=0.4', fc='#FFF7E6', ec=ACCENT, lw=1))

ax.text(50, 64.6, "System Architecture — Two-Tier AWS Deployment",
        fontsize=13, fontweight='bold', color=NAVY, ha='center')

plt.tight_layout()
fig.savefig('architecture.png', dpi=200, bbox_inches='tight',
            facecolor='white')
plt.close(fig)
print('Saved architecture.png')

# ==========================================================================
# 2. WORKFLOW FLOWCHART
# ==========================================================================
fig, ax = plt.subplots(figsize=(9.2, 10.8))
ax.set_xlim(0, 100)
ax.set_ylim(0, 122)
ax.axis('off')

cx = 50           # centre column
bw, bh = 46, 8    # default box size


def node(y, text, fc=LIGHT, ec=NAVY, fs=9.5, w=bw, h=bh, bold=False, tc='#111'):
    box(ax, cx - w / 2, y - h / 2, w, h, text, fc=fc, ec=ec, fs=fs,
        bold=bold, tc=tc)


def down(y1, y2, color=NAVY, text=None):
    arrow(ax, cx, y1, cx, y2, color=color, text=text, tx=cx + 0.5,
          ty=(y1 + y2) / 2, tfs=8)


# Start
node(116, "START", fc=NAVY, ec=NAVY, tc='white', bold=True, w=22, h=6, fs=10)
down(113, 110)

node(106, "User Registration / Login\n(Patient or Doctor)", fc='#DCE6F4',
     ec=BLUE, bold=True)
down(102, 99)

node(95, "Server issues signed JWT token\n(bcrypt-hashed credentials)")
down(91, 88)

node(84, "Patient searches doctors\nby specialisation")
down(80, 77)

node(73, "Select doctor, date &\navailable time slot")
down(69, 66)

# Decision diamond: slot free?
dia_y = 60
dx, dy = 34, 12
ax.add_patch(plt.Polygon([[cx, dia_y + dy / 2], [cx + dx / 2, dia_y],
                          [cx, dia_y - dy / 2], [cx - dx / 2, dia_y]],
                         closed=True, facecolor='#FFF2CC', edgecolor=ACCENT,
                         linewidth=1.8, zorder=2))
ax.text(cx, dia_y, "Slot available?\n(conflict check)", ha='center',
        va='center', fontsize=9, zorder=3)

# No branch -> right, back
arrow(ax, cx + dx / 2, dia_y, 90, dia_y, color='#C00000',
      text="No", tx=80, ty=dia_y + 2.2, tfs=9, tcolor='#C00000')
box(ax, 78, dia_y - 4, 20, 8,
    "Reject booking:\n'Slot already booked'", fc='#FBE3E3', ec='#C00000',
    fs=8.5)
arrow(ax, 88, dia_y + 4, 73, 73, color='#C00000', rad=-0.3, ls='--', lw=1.3)

# Yes branch down
arrow(ax, cx, dia_y - dy / 2, cx, 50, color=GREEN, text="Yes", tx=cx + 3,
      ty=52, tfs=9, tcolor=GREEN)

node(46, "Appointment stored in MongoDB\n(status = 'pending')", fc='#E8F0E1',
     ec=GREEN)
down(42, 39)

node(35, "Doctor reviews on dashboard:\napprove / reject / complete")
down(31, 28)

node(24, "Doctor uploads prescription\n→ stored in Amazon S3")
down(20, 17)

node(13, "Patient views history &\nprescription via pre-signed URL",
     fc='#DCE6F4', ec=BLUE)
down(9, 6)

node(3, "END", fc=NAVY, ec=NAVY, tc='white', bold=True, w=22, h=6, fs=10)

ax.text(50, 121, "Application Workflow — Cloud-Based Medical "
        "Appointment System", fontsize=12.5, fontweight='bold', color=NAVY,
        ha='center')

plt.tight_layout()
fig.savefig('flowchart.png', dpi=200, bbox_inches='tight', facecolor='white')
plt.close(fig)
print('Saved flowchart.png')
